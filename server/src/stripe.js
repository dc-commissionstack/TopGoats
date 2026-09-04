import Stripe from 'stripe';
import { query, exec } from './db.js';
import { addXp } from './herd.js';

/**
 * Stripe integration — Checkout Sessions + webhooks.
 *
 * Reads credentials from env vars (already set on Vercel):
 *   STRIPE_SECRET_KEY     — the owner's live secret key (also accepts STRIPE_KEY for local dev)
 *   STRIPE_WEBHOOK_SECRET — signing secret for the /api/webhooks/stripe endpoint
 *
 * Payout math (Herd rank fees + SSF) lives below in getPlatformFee/getSsfFee/calculatePayout.
 */

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

let stripe = null;

export function isStripeConfigured() {
  return !!STRIPE_SECRET_KEY;
}

export function getStripe() {
  if (!stripe) {
    if (!STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not configured');
    stripe = new Stripe(STRIPE_SECRET_KEY);
  }
  return stripe;
}

// ---------------------------------------------------------------------------
// Product catalog (amounts in cents)
// ---------------------------------------------------------------------------
const PRODUCTS = {
  song_credit: {
    name: 'Song Credit',
    amount: 100, // $1.00
    mode: 'payment',
  },
  catalog_bundle: {
    name: 'Catalog Bundle',
    amount: 700, // $7.00
    mode: 'payment',
  },
  premium: {
    name: 'Premium Membership',
    amount: 999, // $9.99
    mode: 'subscription',
    recurring: { interval: 'month' },
  },
  copyright_filing: {
    name: 'Copyright Filing',
    amount: 5000, // $50.00
    mode: 'payment',
  },
  donation: {
    name: 'Sovereignty Donation',
    amount: 500, // $5.00
    mode: 'payment',
  },
};

/**
 * Create a Stripe Checkout Session and return its hosted URL.
 * opts: { userId (buyer), artistId (seller for song/catalog), trackId, successUrl, cancelUrl }
 */
export async function createCheckoutSession(type, opts = {}) {
  const product = PRODUCTS[type];
  if (!product) throw new Error(`Unknown product type: ${type}`);

  const s = getStripe();

  const lineItem = {
    price_data: {
      currency: 'usd',
      product_data: { name: product.name },
      unit_amount: product.amount,
    },
    quantity: 1,
  };
  if (product.mode === 'subscription') {
    lineItem.price_data.recurring = product.recurring;
  }

  const session = await s.checkout.sessions.create({
    mode: product.mode,
    line_items: [lineItem],
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    client_reference_id: opts.userId || opts.artistId || '',
    metadata: {
      type,
      userId: opts.userId || '',
      artistId: opts.artistId || '',
      trackId: opts.trackId || '',
    },
  });

  return session;
}

// ---------------------------------------------------------------------------
// Webhook handling
// ---------------------------------------------------------------------------

/**
 * Express route handler for POST /api/webhooks/stripe.
 * MUST be mounted with express.raw({ type: 'application/json' }) so req.body is a Buffer.
 */
export async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    if (STRIPE_WEBHOOK_SECRET) {
      event = getStripe().webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } else {
      // Local/dev fallback — production MUST set STRIPE_WEBHOOK_SECRET.
      console.warn('STRIPE_WEBHOOK_SECRET not set — accepting webhook WITHOUT signature verification');
      event = JSON.parse(req.body.toString('utf8'));
    }
  } catch (err) {
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
  }

  // Idempotency: if we've already processed this event, ack immediately.
  const already = await query('SELECT event_id FROM stripe_events WHERE event_id = $1', [event.id]);
  if (already && already.length > 0) {
    return res.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutCompleted(event.data.object);
        break;
      }
      case 'invoice.paid': {
        await handleInvoicePaid(event.data.object);
        break;
      }
      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(event.data.object);
        break;
      }
      default:
        // ignore other event types
        break;
    }

    await exec(
      'INSERT INTO stripe_events (event_id, type) VALUES ($1, $2) ON CONFLICT (event_id) DO NOTHING',
      [event.id, event.type]
    );
    return res.json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err.message);
    // Return 500 so Stripe retries the delivery.
    return res.status(500).json({ error: err.message });
  }
}

async function handleCheckoutCompleted(session) {
  const meta = session.metadata || {};
  const type = meta.type || 'donation';
  const amount = session.amount_total || 0;
  const currency = (session.currency || 'usd').toLowerCase();
  const customerId = session.customer || null;

  if (type === 'premium') {
    // Grant premium immediately; invoice.paid will refine the exact period end
    // and record the revenue (avoiding double-count of the first payment).
    const buyerId = meta.userId || session.client_reference_id || null;
    if (buyerId) {
      const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await grantPremium(buyerId, customerId, session.subscription || null, periodEnd);
    }
    return;
  }

  // One-time purchases (song credit, catalog bundle, copyright filing, donation).
  const sellerId = meta.artistId || meta.userId || session.client_reference_id || null;

  const inserted = await recordOrder({
    id: session.id,
    userId: sellerId,
    stripeCustomerId: customerId,
    type,
    amount,
    currency,
  });

  if (inserted && sellerId && (type === 'song_credit' || type === 'catalog_bundle')) {
    await awardSaleXp(sellerId, amount, session.id);
  }
}

async function handleInvoicePaid(invoice) {
  const subId = invoice.subscription || null;
  const customerId = invoice.customer || null;
  const periodEndSec = invoice.lines?.data?.[0]?.period?.end;
  const periodEnd = periodEndSec ? new Date(periodEndSec * 1000) : null;

  let userId = null;
  if (subId) {
    const rows = await query('SELECT id FROM herd_users WHERE stripe_subscription_id = $1', [subId]);
    userId = rows && rows.length > 0 ? rows[0].id : null;
  }
  if (!userId && customerId) {
    const rows = await query('SELECT id FROM herd_users WHERE stripe_customer_id = $1', [customerId]);
    userId = rows && rows.length > 0 ? rows[0].id : null;
  }

  if (userId && periodEnd) {
    await exec(
      'UPDATE herd_users SET premium_until = $2, updated_at = NOW() WHERE id = $1',
      [userId, periodEnd]
    );
  }

  // Record recurring premium revenue — idempotent on invoice id.
  await recordOrder({
    id: invoice.id,
    userId,
    stripeCustomerId: customerId,
    type: 'premium',
    amount: invoice.amount_paid || 0,
    currency: (invoice.currency || 'usd').toLowerCase(),
  });
}

async function handleSubscriptionDeleted(sub) {
  await exec(
    'UPDATE herd_users SET premium_until = NOW(), updated_at = NOW() WHERE stripe_subscription_id = $1',
    [sub.id]
  );
}

async function grantPremium(userId, stripeCustomerId, stripeSubscriptionId, periodEnd) {
  await exec(
    `UPDATE herd_users
       SET stripe_customer_id = COALESCE($2, stripe_customer_id),
           stripe_subscription_id = COALESCE($3, stripe_subscription_id),
           premium_until = $4,
           updated_at = NOW()
     WHERE id = $1`,
    [userId, stripeCustomerId, stripeSubscriptionId, periodEnd]
  );
}

/**
 * Insert an order idempotently. Returns true if a new row was inserted (vs. a duplicate).
 */
async function recordOrder({ id, userId, stripeCustomerId, type, amount, currency }) {
  const res = await exec(
    `INSERT INTO orders (id, user_id, stripe_customer_id, type, amount_total, currency, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'paid')
     ON CONFLICT (id) DO NOTHING`,
    [id, userId, stripeCustomerId, type, amount, currency]
  );
  return res.rowCount > 0;
}

async function awardSaleXp(sellerId, amountCents, orderId) {
  // first_sale: only if the seller has no prior song/catalog order.
  const prior = await query(
    'SELECT id FROM orders WHERE user_id = $1 AND type IN ($2, $3) AND id <> $4 LIMIT 1',
    [sellerId, 'song_credit', 'catalog_bundle', orderId]
  );
  if (!prior || prior.length === 0) {
    try { await addXp(sellerId, 'first_sale'); } catch (e) { /* silent */ }
  }
  // sales_gmv: one award per $10 in GMV.
  const units = Math.floor(amountCents / 1000);
  for (let i = 0; i < units; i++) {
    try { await addXp(sellerId, 'sales_gmv'); } catch (e) { /* silent */ }
  }
}

// ---------------------------------------------------------------------------
// Payout math (Herd rank fees + Sovereign Sound Foundation fee)
// ---------------------------------------------------------------------------

export function getPlatformFee(rankName) {
  const fees = {
    'Kid': 0.05,
    'Yearling': 0.045,
    'Ram': 0.04,
    'Great Goat': 0.03,
    'Top Goat': 0.02,
  };
  return fees[rankName] || 0.05;
}

export function getSsfFee(platformFee, isFlashLiquidation = false) {
  const ssfRate = isFlashLiquidation ? 0.02 : 0.01;
  return platformFee * ssfRate;
}

export function calculatePayout(price, rankName, isFlashLiquidation = false) {
  let stripeFee;
  if (isFlashLiquidation || price <= 1.0) {
    // Microtransaction pricing
    stripeFee = price * 0.05 + 0.05;
  } else {
    stripeFee = price * 0.029 + 0.30;
  }

  const platformFee = getPlatformFee(rankName) * price;
  const ssfFee = getSsfFee(platformFee, isFlashLiquidation);
  const artistPayout = price - stripeFee - platformFee - ssfFee;

  return {
    price,
    stripeFee: Math.round(stripeFee * 100) / 100,
    platformFee: Math.round(platformFee * 100) / 100,
    ssfFee: Math.round(ssfFee * 100) / 100,
    artistPayout: Math.max(Math.round(artistPayout * 100) / 100, 0),
    isFlashLiquidation,
  };
}
