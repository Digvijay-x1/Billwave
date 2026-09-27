# Billwave on your own Cloudflare

This repo was rebranded from `owostack` to **Billwave** and published under the
`@digvijay-x1` npm scope. Everything that pointed at the previous owner's
Cloudflare account, domain and npm packages has been replaced with a placeholder
or a scoped name. This file is the checklist to stand it up in **your** account.

## 1. What is already done

| Area | State |
| --- | --- |
| Brand strings | `owostack`/`Owostack`/`OWOSTACK` → `billwave`/`Billwave`/`BILLWAVE` (docs, marketing, dashboard, API, READMEs) |
| npm packages | `@digvijay-x1/billwave`, `@digvijay-x1/billwave-cli`, `@digvijay-x1/types` (plus private `@digvijay-x1/{db,adapters,analytics,svelte}`) |
| SDK surface | `import { Billwave } from "@digvijay-x1/billwave"`; `BillwaveError`; client instance `billwave` |
| CLI | bins `billwave` + `bw`; config file `billwave.config.{ts,js,mjs,mts,cts}`; credentials in `~/.billwave/config.json` |
| Env vars | `BILLWAVE_SECRET_KEY`, `BILLWAVE_MODE`, `BILLWAVE_API_URL`, `BILLWAVE_API_TEST_URL`, `BILLWAVE_API_LIVE_URL` |
| API keys | new prefix `billwave_sk_{test,live}_<48 hex>` |
| Cloudflare worker/resource **names** | `billwave-api`, `billwave-api-test`, `billwave-api-live`, `billwave-dashboard`, `billwave-docs`, `billwave-marketing`, D1 `billwave`/`billwave-test`/`billwave-live`/`billwave-auth` |
| Domain | every `*.owostack.com` URL is now the placeholder `*.billwave.example` (172 occurrences) |
| Changelogs | package changelogs reset; `.changeset/billwave-rebrand.md` documents the rename |

## 2. What you must supply

1. **Cloudflare login** — `npx --yes wrangler@4 login` (or `CLOUDFLARE_API_TOKEN`).
2. **A domain you own** (optional for a first deploy).
3. **Secrets** — see `apps/api/.env.example`.
4. **npm publish rights** for the `@digvijay-x1` scope (`npm login`, then `pnpm release`).

## 3. Provision Cloudflare

```bash
npx --yes wrangler@4 login
pnpm cf:provision        # creates D1 + KV + queues, patches apps/api/wrangler.jsonc
```

`apps/api/wrangler.jsonc` currently contains `REPLACE_ME_*` tokens, because the
previous IDs belonged to another account:

| Token | Resource |
| --- | --- |
| `REPLACE_ME_D1_BUSINESS_ID` | D1 `billwave` (business data, dev) |
| `REPLACE_ME_D1_TEST_ID` | D1 `billwave-test` (business data, sandbox) |
| `REPLACE_ME_D1_LIVE_ID` | D1 `billwave-live` (business data, live) |
| `REPLACE_ME_D1_AUTH_ID` | D1 `billwave-auth` (core/auth data) |
| `REPLACE_ME_KV_TEST_ID` | KV `billwave-keys-cache-test` (sandbox API keys + cache) |
| `REPLACE_ME_KV_LIVE_ID` | KV `billwave-keys-cache-live` (live API keys + cache) |
| `REPLACE_ME_KV_SHARED_ID` | KV `billwave-cache-shared` (shared cache) |
| `REPLACE_ME_PIPELINE_ID` | optional events Pipeline (`USE_EVENTS_PIPELINE=true`) |

Durable Objects (`UsageMeterDO`, `UsageLedgerDO`) and the five Workflows are
created automatically by `wrangler deploy`. Analytics Engine datasets
(`billwave_api_{dev,test,live}`) appear on first write.

## 4. Point it at your domain

```bash
grep -rl 'billwave\.example' . --exclude-dir=.git --exclude-dir=node_modules \
  | xargs sed -i 's/billwave\.example/YOUR-DOMAIN.com/g'
```

This updates wrangler `routes` (`billwave.example`, `api.`, `sandbox.`, `docs.`),
`BETTER_AUTH_URL`, CORS allowlists, OpenAPI servers, email sender
(`no-reply@mail.billwave.example`) and the docs/marketing links.

No domain yet? Remove or comment the `routes` blocks in
`apps/api/wrangler.jsonc`, `apps/docs/wrangler.jsonc` and
`apps/marketing/wrangler.jsonc` — workers.dev URLs stay enabled by default.

## 5. Migrate and deploy

```bash
pnpm db:migrate:local      # local dev D1
pnpm db:migrate:test       # remote --env test
pnpm db:migrate:live       # remote --env live

pnpm api:deploy:test
pnpm api:deploy:live
```

`ENCRYPTION_KEY` encrypts `provider_accounts` at rest: put the same value in
every environment and never rotate it without re-encrypting existing rows.

## 6. Publish the packages

```bash
npm login                                   # as the @digvijay-x1 scope owner
pnpm install
pnpm version-packages                       # consumes .changeset/billwave-rebrand.md
pnpm release                                # builds + `changeset publish`
```

`owostack`, `owosk` and `@owostack/types` on npm belong to someone else and are
**not** used by this repo any more. For CI publishing, either set an `NPM_TOKEN`
secret or configure npm Trusted Publishing for `Digvijay-x1/Billwave`
(workflow `release.yml`, environment `release`).

## 7. Plan requirements and cost

Nothing in this repo requires a paid Cloudflare plan to *deploy and run*, with one
exception in the repo config that is already handled: the Workers Free plan only
allows **SQLite-backed Durable Objects**, so `UsageMeterDO` is declared with
`new_sqlite_classes` (it only uses the KV-style `storage.get/put` + alarm APIs,
which the SQLite backend supports). Use Workers Paid if you need the legacy
KV-backed backend or higher limits.

| Service | Free plan (as of 2026) | Workers Paid ($5/month) |
| --- | --- | --- |
| Workers | 100k requests/day, 10 ms CPU per invocation | 10M requests/month included, 30M CPU-ms, 30 s CPU |
| D1 | 10 databases, 500 MB per DB, 5 GB/account, **50 queries per invocation** | 10 GB per DB, 1 TB/account, 1,000 queries per invocation |
| KV | 100k reads/day, **1,000 writes/day**, 1 GB | unlimited reads/writes |
| Queues | included: 10k operations/day, 24 h retention | 14-day retention |
| Durable Objects | SQLite backend only, 100k requests/day | KV backend, higher limits |
| Workflows | included: 3,000 steps/day, 10 ms CPU/invocation, 1 GB-month | 500k steps/month + CPU/requests; step + storage billing starts 2026-08-10 |
| Analytics Engine | 100k data points/day, 10k read queries/day (currently not billed at all) | 10M points/month included |
| Email (`send_email` binding) | only to *verified destination* addresses in your account | arbitrary recipients. **Not used by this codebase** - it sends through Resend |
| Pipelines / R2 | optional, `USE_EVENTS_PIPELINE=false` by default; R2 has a free tier | - |

Everything else the remaining steps need is free:

- npm: publishing unlimited **public** packages is free.
- GitHub: private repo is free; the release workflow fits the free Actions minutes.
- Resend (email): free tier, enough for development and a small launch.
- Paystack / Stripe / Dodo Payments / Bachs: no monthly fee, test modes free;
  they charge per transaction only once you take real money.
- Google / GitHub OAuth apps and Discord: free.
- Domain: the one real cost if you want `api.`/`app.`/`docs.` custom domains
  instead of `*.workers.dev` (~$10/year at Cloudflare Registrar, sold at cost).

Watch the free ceilings first: KV's 1,000 writes/day (API keys + cache), the 10 ms
CPU per invocation, D1's 50 queries per invocation and 500 MB per database, and
3,000 workflow steps/day. `$5/month` Workers Paid removes all of them.

## 8. Known leftovers you may still want to change

- 6 social-preview images embed the previous owner's name in their XMP metadata
  (`apps/marketing/static/og.png`, `og.jpg`, `og-plain.png`,
  `apps/dashboard/static/og.png`, `apps/docs/public/og.png`,
  `apps/docs/public/images/og.jpg`). Re-export them with Billwave branding.
- Discord invite links point at the Billwave community
  (`https://discord.gg/9YGpHeBX2`).
- `apps/docs/src/routes/api/assistant/stream.ts` calls
  `https://cull.avdorr12345.workers.dev`, and the docs sidebar links to
  `github.com/Abdulmumin1/cull` ("Powered by Cull") — both belong to the previous
  owner's project.
- `apps/api/send-invite.cjs` contains hardcoded join links and the old sender
  address.
