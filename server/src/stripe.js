/**
 * Stripe Connect Integration Plan
 * 
 * Based on commercial_launch_strategy.md
 * 
 * Architecture: Stripe Connect Express with Destination Charges
 * 
 * Flow of Funds:
 * 1. Fan pays for a track ($1.00 - $10.00+)
 * 2. Stripe processing: 2.9% + $0.30 (standard) or 5% + $0.05 (microtransaction)
 * 3. Platform fee: Dynamic based on Herd Rank (5.0% → 2.0%)
 * 4. SSF: 1.0% of platform fee earmarked for Sovereign Sound Foundation
 * 5. Artist: Receives remainder via Stripe Connect Express dashboard
 * 
 * Herd Rank → Platform Fee mapping:
 *   Kid:        5.0%
 *   Yearling:   4.5%
 *   Ram:        4.0%
 *   Great Goat: 3.0%
 *   Top Goat:   2.0%
 * 
 * Flash Liquidation Deals ($1.00/song):
 * - Uses Stripe Microtransaction Pricing (5% + $0.05)
 * - Platform fee capped to keep artist take above $0.80
 * - SSF contribution doubled to 2.0%
 * 
 * Implementation steps once Stripe API keys are configured:
 * 
 * 1. Install: npm install stripe
 * 2. Set env vars: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
 * 3. Create Stripe Connect Express accounts for artists
 * 4. Implement destination charges:
 *    const paymentIntent = await stripe.paymentIntents.create({
 *      amount: Math.round(price * 100), // cents
 *      currency: 'usd',
 *      application_fee_amount: Math.round(platformFee + ssfFee),
 *      transfer_data: {
 *        destination: artist.stripeAccountId,
 *      },
 *    });
 * 5. Set up webhooks for account onboarding completion
 * 6. Handle flash liquidation pricing tier
 */

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