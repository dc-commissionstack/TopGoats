#!/bin/bash
# Top Goats Tier 1 DM Outreach Script
# Reads drafts from personalized_dm_drafts_tier1.md and sends via send_dm.js
# 
# Usage:
#   export TWITTER_BEARER_TOKEN="..."
#   bash send_tier1_dms.sh              # Send for real
#   bash send_tier1_dms.sh --dry-run    # Preview without sending

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DM_SCRIPT="$SCRIPT_DIR/send_dm.js"
DRAFTS_FILE="$SCRIPT_DIR/personalized_dm_drafts_tier1.md"
LOG_FILE="$SCRIPT_DIR/dm_send_log_$(date +%Y%m%d_%H%M%S).log"

DRY_RUN=""
if [ "$1" = "--dry-run" ]; then
  DRY_RUN="--dry-run"
  echo "🔍 DRY RUN MODE — No DMs will actually be sent"
  echo ""
fi

if [ ! -f "$DM_SCRIPT" ]; then
  echo "❌ send_dm.js not found at $DM_SCRIPT"
  exit 1
fi

if [ ! -f "$DRAFTS_FILE" ]; then
  echo "❌ Drafts file not found at $DRAFTS_FILE"
  exit 1
fi

if [ -z "$TWITTER_BEARER_TOKEN" ]; then
  echo "❌ TWITTER_BEARER_TOKEN env var is not set"
  echo "   export TWITTER_BEARER_TOKEN=\"your_token_here\""
  exit 1
fi

echo "🐐 Top Goats — Tier 1 DM Outreach"
echo "================================="
echo "Drafts file: $DRAFTS_FILE"
echo "Log file:    $LOG_FILE"
echo "Mode:        ${DRY_RUN:-LIVE}"
echo ""

# Run the sender script
echo "Starting batch send..."
node "$DM_SCRIPT" --batch-file "$DRAFTS_FILE" $DRY_RUN 2>&1 | tee "$LOG_FILE"

EXIT_CODE=$?
echo ""
if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Batch complete! Log saved to $LOG_FILE"
else
  echo "❌ Batch finished with errors. Check $LOG_FILE for details."
fi

exit $EXIT_CODE