#!/usr/bin/env node
/**
 * Twitter DM Sender — Top Goats Beta Outreach
 * 
 * Uses OAuth 1.0a for DM sending (user context required) and Bearer Token for user lookup.
 * 
 * Usage:
 *   node send_dm.js --handle @username --message "Your DM text here"
 *   node send_dm.js --handle @username --message "..." --dry-run
 *   node send_dm.js --batch-file drafts.md
 * 
 * Environment variables required:
 *   TWITTER_BEARER_TOKEN          — For user lookup (v2 API)
 *   TWITTER_API_KEY               — OAuth 1.0a consumer key
 *   TWITTER_API_SECRET            — OAuth 1.0a consumer secret
 *   TWITTER_ACCESS_TOKEN          — OAuth 1.0a user access token
 *   TWITTER_ACCESS_TOKEN_SECRET   — OAuth 1.0a user access token secret
 * 
 * Rate limits: ~50 DMs per 24h window. 30s delay enforced between sends.
 */

const { TwitterApi } = require('twitter-api-v2');

const dryRun = process.argv.includes('--dry-run');

function getArg(name) {
  const idx = process.argv.indexOf(name);
  if (idx >= 0 && idx + 1 < process.argv.length) return process.argv[idx + 1];
  return null;
}

const handle = getArg('--handle');
const message = getArg('--message');
const batchFile = getArg('--batch-file');

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const API_KEY = process.env.TWITTER_API_KEY;
const API_SECRET = process.env.TWITTER_API_SECRET;
const ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
const ACCESS_SECRET = process.env.TWITTER_ACCESS_TOKEN_SECRET;

// Create API clients
function getClients() {
  if (!BEARER_TOKEN) throw new Error('TWITTER_BEARER_TOKEN is required');
  if (!API_KEY || !API_SECRET || !ACCESS_TOKEN || !ACCESS_SECRET) {
    throw new Error('OAuth 1.0a credentials required: TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET');
  }

  const userClient = new TwitterApi({
    appKey: API_KEY,
    appSecret: API_SECRET,
    accessToken: ACCESS_TOKEN,
    accessSecret: ACCESS_SECRET,
  });

  const appClient = new TwitterApi(BEARER_TOKEN);

  return { userClient, appClient };
}

// Look up user by handle (v2 API, uses Bearer Token)
async function lookupUser(appClient, handle) {
  const cleanHandle = handle.replace(/^@/, '');
  const user = await appClient.v2.userByUsername(cleanHandle);
  if (!user.data) throw new Error(`User @${cleanHandle} not found`);
  return { id: user.data.id, name: user.data.name, username: user.data.username };
}

// Send DM (uses OAuth 1.0a user context)
async function sendDM(userClient, recipientId, text) {
  if (dryRun) {
    console.log(`  [DRY RUN] Would send DM to user ${recipientId}: "${text.slice(0, 50)}..."`);
    return { id: 'dry-run' };
  }

  const dm = await userClient.v2.sendDm({
    participant_id: recipientId,
    text: text,
  });

  return dm;
}

// Parse batch file
function parseBatchFile(content) {
  const entries = [];
  const lines = content.split('\n');
  let current = null;

  for (const line of lines) {
    const handleMatch = line.match(/@(\w+)/);
    if (line.startsWith('##') && handleMatch) {
      if (current) entries.push(current);
      current = { handle: `@${handleMatch[1]}`, message: '' };
    } else if (current && line.trim() && !line.startsWith('#')) {
      current.message += line.trim() + ' ';
    }
  }
  if (current) entries.push(current);

  return entries.map(e => ({
    ...e,
    message: e.message.trim().replace(/\s+/g, ' '),
  }));
}

// Main
async function main() {
  try {
    const { userClient, appClient } = getClients();
  } catch (err) {
    console.error('Error:', err.message);
    console.error('\nRequired env vars:');
    console.error('  TWITTER_BEARER_TOKEN');
    console.error('  TWITTER_API_KEY');
    console.error('  TWITTER_API_SECRET');
    console.error('  TWITTER_ACCESS_TOKEN');
    console.error('  TWITTER_ACCESS_TOKEN_SECRET');
    process.exit(1);
  }

  const { userClient, appClient } = getClients();

  if (batchFile) {
    const fs = await import('fs');
    const content = fs.readFileSync(batchFile, 'utf-8');
    const entries = parseBatchFile(content);
    
    console.log(`Found ${entries.length} DM targets in batch file.\n`);

    for (const [i, entry] of entries.entries()) {
      console.log(`[${i + 1}/${entries.length}] Processing ${entry.handle}...`);
      
      try {
        if (!dryRun) {
          const user = await lookupUser(appClient, entry.handle);
          console.log(`  → Found user: ${user.name} (${user.id})`);
          
          let msg = entry.message;
          if (msg.length > 10000) {
            console.log(`  ⚠ Message is ${msg.length} chars (max 10000). Truncating.`);
            msg = msg.slice(0, 9997) + '...';
          }
          
          const result = await sendDM(userClient, user.id, msg);
          console.log(`  ✓ DM sent!`);
        } else {
          console.log(`  [DRY RUN] Would look up ${entry.handle} and send: "${entry.message.slice(0, 60)}..."`);
        }
        
        if (i < entries.length - 1 && !dryRun) {
          console.log('  Waiting 30s before next send...');
          await new Promise(r => setTimeout(r, 30000));
        }
      } catch (err) {
        console.error(`  ✗ Error: ${err.message}`);
      }
      
      console.log('');
    }

    console.log('Batch complete!');
    return;
  }

  if (!handle || !message) {
    console.error('Usage:');
    console.error('  node send_dm.js --handle @username --message "text" [--dry-run]');
    console.error('  node send_dm.js --batch-file drafts.md [--dry-run]');
    process.exit(1);
  }

  try {
    const user = await lookupUser(appClient, handle);
    console.log(`Found user: ${user.name} (@${user.username})`);
    const result = await sendDM(userClient, user.id, message);
    if (!dryRun) console.log('DM sent!');
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();