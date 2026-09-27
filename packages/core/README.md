# billwave

Core SDK for the Billwave billing infrastructure. Build a working billing flow for your AI SaaS or platform in minutes.

## Installation

```bash
npm install @digvijay-x1/billwave
```

## Quickstart

Initialize the SDK with your API key from the Billwave dashboard:

```ts
import { Billwave } from "@digvijay-x1/billwave";

const billwave = new Billwave({
  secretKey: process.env.BILLWAVE_SECRET_KEY,
  mode: "sandbox", // use "live" for production
});
```

### 1. Attach a customer to a plan

Create a checkout session or manage an existing subscription:

```ts
const attach = await billwave.attach({
  customer: "user_123",
  product: "starter_plan",
  customerData: { email: "user@example.com" },
});

if (attach.checkoutUrl) {
  // Redirect your user to checkout
  window.location.href = attach.checkoutUrl;
}
```

### 2. Check feature access

Verify if a customer has access to a feature based on their plan:

```ts
const access = await billwave.check({
  customer: "user_123",
  feature: "api-calls",
});

if (access.allowed) {
  // Allow request
}

if (access.credits?.source === "credit_system") {
  console.log(access.credits.addonBalance);
  console.log(access.credits.plan.balance);
}
```

### 3. Track usage

Record usage for metered features:

```ts
await billwave.track({
  customer: "user_123",
  feature: "api-calls",
  value: 1,
});
```

### 4. Manage customer billing controls

Inspect and update customer-specific overage behavior through the same `customer` namespace:

```ts
const customer = await billwave.customer({
  email: "billing@acme.com",
  name: "Acme Corporation",
});

await billwave.customer.setFeatureConfig({
  customer: customer.id,
  feature: "api-calls",
  overage: "block",
  maxOverageUnits: 1000,
});

await billwave.customer.setOverageLimit({
  customer: customer.id,
  maxOverageAmount: 500_000,
  onLimitReached: "block",
});
```

## Features

- **Feature Gating**: Instant access control for boolean and metered features.
- **Usage Metering**: Record usage and enforce limits automatically.
- **Checkout Flows**: Generate checkout sessions for new subscriptions or plan upgrades.
- **Catalog Synchronization**: Define plans and features declaratively in your codebase and sync to the cloud.
- **Multi-Provider Support**: Built-in support for Paystack, Stripe, Dodo Payments, Polar and Bachs.
- **Full TypeScript Support**: Comprehensive type definitions for all methods and responses.

## Related Packages

- [billwave](https://www.npmjs.com/package/billwave) - CLI for catalog sync and project initialization.
- [@digvijay-x1/types](https://www.npmjs.com/package/@digvijay-x1/types) - Shared type definitions.

## Documentation

For full documentation and guides, visit [docs.billwave.example](https://docs.billwave.example).

## License

Apache-2.0
