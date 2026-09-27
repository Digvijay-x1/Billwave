<div align="center">

# 🌊 Billwave

---

## Billing infrastructure for AI SaaS

Build subscriptions, meter usage, manage credits, and gate features with a developer-friendly billing engine powered by Cloudflare.

<p>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-SDK-3178C6?logo=typescript&logoColor=white" />
  <img alt="Cloudflare Workers" src="https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white" />
  <img alt="SvelteKit" src="https://img.shields.io/badge/SvelteKit-Dashboard-FF3E00?logo=svelte&logoColor=white" />
  <a href="https://www.npmjs.com/package/@digvijay-x1/billwave"><img alt="npm package" src="https://img.shields.io/npm/v/@digvijay-x1/billwave?label=npm&logo=npm" /></a>
  <a href="LICENSE"><img alt="Apache 2.0 license" src="https://img.shields.io/badge/License-Apache%202.0-blue" /></a>
</p>

**[Explore the docs](https://docs.billwave.digvijayrawat.me)** · **[Get started](#quick-start)** · **[Report a bug](https://github.com/digvijay-x1/billwave/issues)**

</div>

## What is Billwave?

Billwave is a developer-friendly billing engine that lets you implement subscriptions, usage-based billing, and feature gating.

Billwave supports multiple payment gateways while providing first-class features for:

- **Usage Metering** (track tokens, API calls, seats)
- **Flexible Resets** (minutes, hourly, daily, monthly quotas, yearly, custom)
- **Credit Systems** (shared balances across features)
- **Add-on** (purchased against credit systems, or could be plan based addons)
- **Multi-provider** payment provider is abstracted into an adapter mechanism. (currently implemented - Paystack, Stripe, Dodo Payments, Polar & Bachs)

## Quick Start

```bash
# Install SDK
bun add @digvijay-x1/billwave
```

### 1. Define your features

Create a config file (e.g. `billwave.config.ts`) or run `bunx @digvijay-x1/billwave-cli init`.
define your features using metered(), boolean(), and entity():

```ts
import { metered, boolean, entity } from "@digvijay-x1/billwave";
apiCalls = metered("api-calls", { name: "API Calls" });
analytics = boolean("analytics", { name: "Analytics Dashboard" });
seats = entity("seats", { name: "Team Seats" });
```

### 2. Define your plans.

Define plans and configure features.

```ts
export default new Billwave({
  secretKey: process.env.BILLWAVE_SECRET_KEY!,
  catalog: [
    plan("starter", {
      name: "Starter",
      price: 0,
      currency: "NGN",
      interval: "monthly",
      autoEnable: true,
      features: [apiCalls.limit(1000), analytics.off(), seats.limit(3)],
    }),
    plan("pro", {
      name: "Pro",
      price: 500000,
      currency: "NGN",
      interval: "monthly",
      features: [
        apiCalls.limit(50000, { overage: "charge", overagePrice: 100 }),
        analytics.on(),
        seats.limit(20),
      ],
    }),
    plan("enterprise", {
      name: "Enterprise",
      price: 2000000,
      currency: "NGN",
      interval: "monthly",
      features: [apiCalls.unlimited(), analytics.on(), seats.unlimited()],
    }),
  ],
});
```

### 3. Sync to the API

Using the CLI

```bash
npx @digvijay-x1/billwave-cli sync --config ./billwave.config.ts
```

### 4. Runtime primitives.

This are the calls that would be sprinkled all over ur codebase.

```ts
// 1. Checkout (attach)
const { url } = await billwave.attach({
  customer: "user_123",
  product: "pro_plan",
});

// 2. Check access (check)
const { allowed } = await billwave.check({
  customer: "user_123",
  feature: "api_calls",
});

// 3. Track usage (track)
await billwave.track({
  customer: "user_123",
  feature: "api_calls",
  value: 1,
});
```

That's it. No webhooks (yet), no state syncing, no custom billig logic.

## Monorepo Structure

```
billwave/
├── packages/
│   ├── core/          # Public TypeScript SDK (`billwave`)
│   ├── cli/           # CLI (`billwave`)
│   ├── types/         # Shared public types
│   ├── svelte/        # Svelte bindings (currently internal/private)
│   ├── adapters/      # Provider adapter layer
│   ├── analytics/     # Analytics abstraction
│   └── db/            # Database schema and utilities
├── apps/
│   ├── api/           # Cloudflare Workers API
│   ├── dashboard/     # SvelteKit dashboard
│   ├── docs/          # Documentation site
│   ├── marketing/     # Marketing site
│   └── demo-app/      # Local SDK demo app
```

## Development

```bash
# Install dependencies
pnpm install

# Build the workspace
pnpm build

# Run focused apps
pnpm api:dev
pnpm docs:dev
pnpm --filter billwave-dashboard dev
pnpm --filter billwave-marketing dev
```
