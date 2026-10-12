# Credentials & Secrets — Recovery Map

Secret **values are intentionally NOT stored in this repo** (for security). This file lists every
credential Top Goats uses and where to find or regenerate it.

## Excluded from this repo (by design)
Two local env files were left out of the git archive because they contain live credentials:

| File | Contents |
|---|---|
| `top-goats/.env.prod` (workspace) | Production app secrets (Stripe, Neon Postgres, Neon Object Storage, JWT) |
| `.env.twitter` (workspace root) | Twitter/X DM-sender credentials |

Both still exist on disk in the cto.new workspace until the account is closed — copy them out if
you want a local copy. Everything else is also live in the services below.

## App production secrets
Source of truth: **Vercel → project `top-goats-app` → Settings → Environment Variables** (plus a
local copy in `top-goats/.env.prod`).

| Variable | Where to find / regenerate |
|---|---|
| `DATABASE_URL` | Neon console → project **divine-heart-63524459** → branch **production** → Connection Details |
| `DATABASE_URL_UNPOOLED` | Same Neon project (unpooled connection string) |
| `JWT_SECRET` | Copy from Vercel env, or regenerate with `openssl rand -hex 32` |
| `STRIPE_SECRET_KEY` | Stripe dashboard → Developers → API keys → `sk_live_…` (account `acct_1TboZAAMMiF4H8Wv`, CommissionStack LLC) |
| `STRIPE_WEBHOOK_SECRET` | Stripe dashboard → Developers → Webhooks → endpoint `we_1UCQByAMMiF4H8WvsWTc9wzr` |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Neon object storage credentials (bucket **`uploads`**, region `us-east-2`) |
| `AWS_ENDPOINT_URL_S3` / `S3_ENDPOINT` | Neon object storage S3-compatible endpoint |
| `AWS_REGION` / `S3_REGION` | `us-east-2` |
| `NEON_API_KEY` | Neon console → Account → API Keys |

## Twitter/X DM sender
Source: `.env.twitter` (workspace root). Regenerate at **developer.x.com** → the app's keys & tokens.

- `TWITTER_API_KEY`
- `TWITTER_API_SECRET`
- `TWITTER_ACCESS_TOKEN`
- `TWITTER_ACCESS_TOKEN_SECRET`
- `TWITTER_BEARER_TOKEN`

## Deployment / infra tokens (in cto.new environment)
Regenerate at the respective dashboard if you lose them:
- **Vercel** token (team `dc-commissionstacks-projects`) — vercel.com → Account → Tokens
- **Cloudflare** API token (zone `top-goats.com`) — dash.cloudflare.com → My Profile → API Tokens

## Reference (non-secret identifiers)
- Stripe account: `acct_1TboZAAMMiF4H8Wv` (CommissionStack LLC)
- Stripe webhook: `we_1UCQByAMMiF4H8WvsWTc9wzr`
- Neon project: `divine-heart-63524459` (org `org-fancy-dawn-88202762`, branch `production`)
- Neon object storage bucket: `uploads` (us-east-2)
- Vercel app project: `top-goats-app` · landing project: `top-goats`
- Admin login email: `dc.budge86@gmail.com`
- Founder outreach send-from: `dc@top-goats.com`
