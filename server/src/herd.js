import { execSync } from 'child_process';

/**
 * Herd Ranking System
 * 
 * Tiers (from researcher/community_ranking_logic.md):
 * - Kid (0 XP)
 * - Yearling (500 XP)
 * - Ram (2,500 XP)
 * - Great Goat (10,000 XP)
 * - Top Goat (50,000 XP)
 * 
 * XP gain triggers:
 * - Community Engagement: Post (+10), Comment (+5), Upvote (+2), Accepted Answer (+50), Check-in Streak (+20)
 * - Platform Utility: First Upload (+100), Copyright (+50), Profile Complete (+200), Link Storefront (+50)
 * - Commercial: First Sale (+500), Every $10 Sales (+50), 5-Star Review (+25)
 */

const TIERS = [
  { level: 1, name: 'Kid', minXP: 0, color: '#888' },
  { level: 2, name: 'Yearling', minXP: 500, color: '#6b8e23' },
  { level: 3, name: 'Ram', minXP: 2500, color: '#cd853f' },
  { level: 4, name: 'Great Goat', minXP: 10000, color: '#b8860b' },
  { level: 5, name: 'Top Goat', minXP: 50000, color: '#f7971e' },
];

const XP_RULES = {
  // Community Engagement
  post_created: { xp: 10, category: 'social', description: 'Post created' },
  comment_reply: { xp: 5, category: 'social', description: 'Comment or reply' },
  upvote_received: { xp: 2, category: 'social', description: 'Upvote received' },
  accepted_answer: { xp: 50, category: 'social', description: 'Accepted answer in forums' },
  weekly_checkin: { xp: 20, category: 'social', description: 'Weekly check-in streak' },
  
  // Platform Utility
  first_upload: { xp: 100, category: 'utility', description: 'First track uploaded' },
  copyright_fingerprint: { xp: 50, category: 'utility', description: 'Copyright fingerprint secured' },
  profile_complete: { xp: 200, category: 'utility', description: 'Profile completed' },
  link_storefront: { xp: 50, category: 'utility', description: 'External storefront linked' },
  
  // Commercial Success
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

export function runDb(sql) {
  try {
    const result = execSync(`team-db ${JSON.stringify(sql)}`, {
      encoding: 'utf8',
      timeout: 5000,
    });
    return JSON.parse(result);
  } catch (err) {
    console.error('DB Error:', err.message);
    throw err;
  }
}

export function getTiers() {
  return TIERS;
}

export function getBadges() {
  return BADGES;
}

export function getRank(userId) {
  const users = runDb(`SELECT * FROM herd_users WHERE id = '${userId.replace(/'/g, "''")}'`);
  if (!users || users.length === 0) return null;

  const user = users[0];
  const rank = calculateRank(user.xp);

  const events = runDb(
    `SELECT * FROM xp_events WHERE user_id = '${userId.replace(/'/g, "''")}' ORDER BY created_at DESC LIMIT 20`
  );

  // Get user badges
  const badges = runDb(
    `SELECT * FROM user_badges WHERE user_id = '${userId.replace(/'/g, "''")}'`
  );

  return { user, rank, events, badges: badges || [] };
}

export function addXp(userId, action) {
  const rule = XP_RULES[action];
  if (!rule) throw new Error(`Unknown action: ${action}. Valid: ${Object.keys(XP_RULES).join(', ')}`);

  const users = runDb(`SELECT * FROM herd_users WHERE id = '${userId.replace(/'/g, "''")}'`);
  if (!users || users.length === 0) throw new Error(`User not found: ${userId}`);

  const safeId = userId.replace(/'/g, "''");
  const safeDesc = rule.description.replace(/'/g, "''");

  runDb(
    `INSERT INTO xp_events (user_id, action, xp_gained, description) VALUES ('${safeId}', '${action}', ${rule.xp}, '${safeDesc}')`
  );

  runDb(
    `UPDATE herd_users SET xp = xp + ${rule.xp}, updated_at = datetime('now') WHERE id = '${safeId}'`
  );

  const updated = runDb(`SELECT * FROM herd_users WHERE id = '${safeId}'`);
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

export { TIERS, XP_RULES, BADGES };