#!/usr/bin/env bash
# Publish this site live to Vercel and print the live URL.
#
# Contract:
#   VERCEL_TOKEN   (required) — collected from the owner via the go-live flow.
#   DATABASE_URL   (optional) — passed as a runtime env var when the site uses a DB.
#   VERCEL_SCOPE   (optional) — team slug; auto-resolved from the token if unset.
#   VERCEL_TEAM_ID (optional) — team id; auto-resolved from the token if unset.
#
# Scope + team id are auto-resolved from the token (personal tokens have neither;
# team tokens report their default team), so the owner only ever pastes the token.
# Making the project public drops the org SSO protection new projects inherit,
# which would otherwise put a login wall in front of a site meant for the public.
set -euo pipefail
cd "$(dirname "$0")"
umask 002

: "${VERCEL_TOKEN:?set VERCEL_TOKEN (collect it from the owner first)}"
PROJECT_NAME="${VERCEL_PROJECT_NAME:-$(basename "$(pwd)")}"
VERCEL="bunx vercel@latest"

# Resolve the token's team (slug for --scope, id for the make-public API call).
# Empty for a personal-account token. bun is always present in the sandbox.
if [ -z "${VERCEL_SCOPE:-}" ] || [ -z "${VERCEL_TEAM_ID:-}" ]; then
  RESOLVED="$(VERCEL_TOKEN="$VERCEL_TOKEN" bun -e '
    const h = { headers: { Authorization: "Bearer " + process.env.VERCEL_TOKEN } };
    const [u, tj] = await Promise.all([
      fetch("https://api.vercel.com/v2/user", h).then((r) => r.json()).catch(() => ({})),
      fetch("https://api.vercel.com/v2/teams?limit=50", h).then((r) => r.json()).catch(() => ({})),
    ]);
    const teams = tj.teams || [];
    const def = (u.user || u || {}).defaultTeamId;
    const t = teams.find((x) => x.id === def) || teams[0];
    if (t) process.stdout.write(t.id + " " + t.slug);
  ' 2>/dev/null || true)"
  VERCEL_TEAM_ID="${VERCEL_TEAM_ID:-${RESOLVED%% *}}"
  [ "$RESOLVED" != "${RESOLVED#* }" ] && VERCEL_SCOPE="${VERCEL_SCOPE:-${RESOLVED##* }}"
fi

echo "==> building Vercel bundle"
bash ./build-vercel.sh

SCOPE_ARGS=()
if [ -n "${VERCEL_SCOPE:-}" ]; then SCOPE_ARGS=(--scope "$VERCEL_SCOPE"); fi
ENV_ARGS=()
if [ -n "${DATABASE_URL:-}" ]; then ENV_ARGS=(-e "DATABASE_URL=$DATABASE_URL"); fi

echo "==> deploying${VERCEL_SCOPE:+ (scope: $VERCEL_SCOPE)}"
DEPLOY_OUT="$($VERCEL deploy --prebuilt --yes --token "$VERCEL_TOKEN" \
  --name "$PROJECT_NAME" "${SCOPE_ARGS[@]}" "${ENV_ARGS[@]}" 2>&1)" || {
  printf '%s\n' "$DEPLOY_OUT" >&2
  exit 1
}
LIVE_URL="$(printf '%s\n' "$DEPLOY_OUT" | grep -oE 'https://[a-zA-Z0-9._-]+\.vercel\.app' | tail -1)"

if [ -z "$LIVE_URL" ]; then
  echo "deploy finished but no live URL was parsed — output above" >&2
  printf '%s\n' "$DEPLOY_OUT" >&2
  exit 1
fi

echo "==> making the project public"
TEAM_QS=""
if [ -n "${VERCEL_TEAM_ID:-}" ]; then TEAM_QS="?teamId=$VERCEL_TEAM_ID"; fi
curl -sf -X PATCH "https://api.vercel.com/v9/projects/${PROJECT_NAME}${TEAM_QS}" \
  -H "Authorization: Bearer $VERCEL_TOKEN" -H "Content-Type: application/json" \
  -d '{"ssoProtection":null}' >/dev/null ||
  echo "warning: could not disable SSO protection (site may show a login wall)" >&2

echo "LIVE: $LIVE_URL"
