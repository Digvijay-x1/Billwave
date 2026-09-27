#!/usr/bin/env bash
# =============================================================================
# Billwave - Cloudflare provisioning for YOUR account
#
# Creates every account-scoped resource the API needs, then patches the
# REPLACE_ME_* placeholders in apps/api/wrangler.jsonc with the real IDs.
#
# Usage:
#   npx --yes wrangler@4 login            # once (or export CLOUDFLARE_API_TOKEN)
#   bash scripts/provision-cloudflare.sh
#
# Re-runnable: already-existing resources are reported and skipped, and a
# placeholder is only patched when an ID is available.
# =============================================================================
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG="$REPO_ROOT/apps/api/wrangler.jsonc"
WRANGLER="${WRANGLER:-npx --yes wrangler@4}"

hr() { printf '\n=== %s ===\n' "$1"; }

if ! $WRANGLER whoami >/dev/null 2>&1; then
  echo "Not logged in to Cloudflare. Run: npx --yes wrangler@4 login" >&2
  echo "(or export CLOUDFLARE_API_TOKEN with Workers + D1 + KV + Queues edit rights)" >&2
  exit 1
fi

# UUID -> D1 id
create_d1() {
  local out
  out="$($WRANGLER d1 create "$1" 2>&1 || true)"
  printf '%s\n' "$out" | grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -n1
}

# 32 hex chars -> KV namespace id
create_kv() {
  local out
  out="$($WRANGLER kv namespace create "$1" 2>&1 || true)"
  printf '%s\n' "$out" | grep -oE '[0-9a-f]{32}' | head -n1
}

patch() {
  local token="$1" value="${2:-}"
  if [ -z "$value" ]; then
    echo "  ! no id for $token - placeholder left in place"
    return
  fi
  sed -i "s|$token|$value|g" "$CONFIG"
  echo "  ok $token -> $value"
}

hr "D1 databases (core + auth)"
D1_BUSINESS="$(create_d1 billwave)";     echo "  billwave       ${D1_BUSINESS:-<exists/unknown>}"
D1_TEST="$(create_d1 billwave-test)";    echo "  billwave-test  ${D1_TEST:-<exists/unknown>}"
D1_LIVE="$(create_d1 billwave-live)";    echo "  billwave-live  ${D1_LIVE:-<exists/unknown>}"
D1_AUTH="$(create_d1 billwave-auth)";    echo "  billwave-auth  ${D1_AUTH:-<exists/unknown>}"

hr "KV namespaces"
KV_TEST="$(create_kv billwave-keys-cache-test)"; echo "  billwave-keys-cache-test ${KV_TEST:-<exists/unknown>}"
KV_LIVE="$(create_kv billwave-keys-cache-live)"; echo "  billwave-keys-cache-live ${KV_LIVE:-<exists/unknown>}"
KV_SHARED="$(create_kv billwave-cache-shared)";  echo "  billwave-cache-shared    ${KV_SHARED:-<exists/unknown>}"

hr "Queues"
for q in overage-billing overage-billing-dlq \
         overage-billing-test overage-billing-test-dlq \
         overage-billing-live overage-billing-live-dlq; do
  if $WRANGLER queues create "$q" >/dev/null 2>&1; then
    echo "  created $q"
  else
    echo "  exists  $q"
  fi
done

hr "Analytics Engine datasets"
echo "  billwave_api_{dev,test,live} are created on first write - nothing to do."
echo "  Durable Objects and Workflows are created by 'wrangler deploy'."

hr "Patching apps/api/wrangler.jsonc"
patch REPLACE_ME_D1_BUSINESS_ID "$D1_BUSINESS"
patch REPLACE_ME_D1_TEST_ID     "$D1_TEST"
patch REPLACE_ME_D1_LIVE_ID     "$D1_LIVE"
patch REPLACE_ME_D1_AUTH_ID     "$D1_AUTH"
patch REPLACE_ME_KV_TEST_ID     "$KV_TEST"
patch REPLACE_ME_KV_LIVE_ID     "$KV_LIVE"
patch REPLACE_ME_KV_SHARED_ID   "$KV_SHARED"

hr "Next steps"
cat <<'EOF'
  1. Use your own domain everywhere (one command, from the repo root):
       grep -rl 'billwave\.example' . --exclude-dir=.git --exclude-dir=node_modules \
         | xargs sed -i 's/billwave\.example/YOUR-DOMAIN.com/g'
     No domain yet? Comment out the "routes" blocks in apps/api/wrangler.jsonc,
     apps/docs and apps/marketing and deploy on workers.dev first.
  2. Optional: create the events Pipeline in the dashboard and set
     REPLACE_ME_PIPELINE_ID (only needed when USE_EVENTS_PIPELINE=true).
  3. Migrations:
       pnpm db:migrate:local     # local dev
       pnpm db:migrate:test      # remote --env test
       pnpm db:migrate:live      # remote --env live
  4. Secrets (see apps/api/.env.example for the full list):
       npx wrangler secret put ENCRYPTION_KEY --env test
       npx wrangler secret put BETTER_AUTH_SECRET --env test
       npx wrangler secret put RESEND_API_KEY --env test
       npx wrangler secret put MANAGED_SANDBOX_PAYSTACK --env test
       ... repeat per provider, per environment (never on live for MANAGED_SANDBOX_*)
  5. Deploy:
       pnpm api:deploy:test
       pnpm api:deploy:live
EOF
