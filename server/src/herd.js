import { query, exec } from './db.js';

/**
 * Herd Ranking System — PostgreSQL Edition
 * 
 * Tiers:
 * - Kid (0 XP)
 * - Yearling (500 XP)
 * - Ram (2,500 XP)
 * - Great Goat (10,000 XP)
 * - Top Goat (50,000 XP)
 */

const TIERS = [
  { level: 1, name: 'Kid', minXP: 0, color: '#888' },
  { level: 2, name: 'Yearling', minXP: 500, color: '#6b8e23' },
  { level: 3, name: 'Ram', minXP: 2500, color: '#cd853f' },
  { level: 4, name: 'Great Goat', minXP: 10000, color: '#b8860b' },
  { level: 5, name: 'Top Goat', minXP: 50000, color: '#f7971e' },
];

const XP_RULES = {
  post_created: { xp: 10, category: 'social', description: 'Post created' },
  comment_reply: { xp: 5, category: 'social', description: 'Comment or reply' },
  upvote_received: { xp: 2, category: 'social', description: 'Upvote received' },
  accepted_answer: { xp: 50, category: 'social', description: 'Accepted answer in forums' },
  weekly_checkin: { xp: 20, category: 'social', description: 'Weekly check-in streak' },
  first_upload: { xp: 100, category: 'utility', description: 'First track uploaded' },
  copyright_fingerprint: { xp: 50, category: 'utility', description: 'Copyright fingerprint secured' },
  profile_complete: { xp: 200, category: 'utility', description: 'Profile completed' },
  link_storefront: { xp: 50, category: 'utility', description: 'External storefront linked' },
  first_sale: { xp: 500, category: 'commerce', description: 'First sale made' },
  sales_gmv: { xp: 50, category: 'commerce', description: 'Every $10 in sales (GMV)' },
  review_received: { xp: 25, category: 'commerce', description: '5-star review received' },
};

const BADGES = [
  { id: 'founding-goat', name: 'Founding Goat', description: 'Exclusive to the first 100 beta users' },
  { id: 'ip-shield', name: 'IP Shield', description: 'Awarded for securing 10+ tracks with copyright fingerprinting' },
  { id: 'collaborator', name: 'The Collaborator', description: 'Awarded for tracks with multiple royalty splits (3+ artists)' },
  { id: 'merchant-goat', name: 'Merchant Goat', description: 'Awarded after reaching $1,000 in lifetime GMV' },
];

export function getTiers() { return TIERS; }
export function getBadges() { return BADGES; }

export async function getRank(userId) {
  const users = await query('SELECT * FROM herd_users WHERE id = $1', [userId]);
  if (!users || users.length === 0) return null;

  const user = users[0];
  const rank = calculateRank(user.xp);

  const events = await query(
    'SELECT * FROM xp_events WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
    [userId]
  );

  const badges = await query(
    'SELECT * FROM user_badges WHERE user_id = $1',
    [userId]
  );

  return { user, rank, events, badges: badges || [] };
}

export async function addXp(userId, action) {
  const rule = XP_RULES[action];
  if (!rule) throw new Error(`Unknown action: ${action}. Valid: ${Object.keys(XP_RULES).join(', ')}`);

  const users = await query('SELECT * FROM herd_users WHERE id = $1', [userId]);
  if (!users || users.length === 0) throw new Error(`User not found: ${userId}`);

  await exec(
    'INSERT INTO xp_events (user_id, action, xp_gained, description) VALUES ($1, $2, $3, $4)',
    [userId, action, rule.xp, rule.description]
  );

  await exec(
    'UPDATE herd_users SET xp = xp + $1, updated_at = NOW() WHERE id = $2',
    [rule.xp, userId]
  );

  const updated = await query('SELECT * FROM herd_users WHERE id = $1', [userId]);
  const user = updated[0];
  const rank = calculateRank(user.xp);

  return { user, rank, xpGained: rule.xp, action, category: rule.category };
}

export function calculateRank(xp) {
  let current = TIERS[0];
  let next = null;

  for (let i = 0; i < TIERS.length; i++) {
    if (xp >= TIERS[i].minXP) {
      current = TIERS[i];
      if (i < TIERS.length - 1) next = TIERS[i + 1];
    }
  }

  const progress = next
    ? Math.min((xp - current.minXP) / (next.minXP - current.minXP), 1)
    : 1;

  return { current, next, progress, xp };
}

// For backwards compat — runDb is no longer used, but stripe.js may import it
export function runDb() {
  throw new Error('runDb() removed — use query()/exec() from db.js instead');
}

export { TIERS, XP_RULES, BADGES };