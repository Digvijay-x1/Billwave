---
"@digvijay-x1/billwave": minor
"@digvijay-x1/billwave-cli": minor
"@digvijay-x1/types": minor
---

Rebrand the platform to **Billwave** and publish it under the `@digvijay-x1` npm scope.

- Packages: `owostack` → `@digvijay-x1/billwave`, `owosk` → `@digvijay-x1/billwave-cli`, `@owostack/types` → `@digvijay-x1/types`.
- SDK: `import { Billwave } from "@digvijay-x1/billwave"` (`Owostack`/`OwostackError` → `Billwave`/`BillwaveError`); the client instance is `billwave`.
- CLI: binaries are `billwave` and `bw`; config files are `billwave.config.{ts,js,mjs,mts,cts}`; credentials live in `~/.billwave/config.json`.
- Env vars are `BILLWAVE_*` (`BILLWAVE_SECRET_KEY`, `BILLWAVE_MODE`, `BILLWAVE_API_URL`, `BILLWAVE_API_TEST_URL`, `BILLWAVE_API_LIVE_URL`).
- API keys now use the `billwave_sk_{test,live}_` prefix.
- Dashboard, docs, marketing copy, OpenAPI metadata and READMEs are rebranded to Billwave.
