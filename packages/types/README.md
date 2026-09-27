# @digvijay-x1/types

Shared TypeScript types for the Billwave billing infrastructure. This package provides the type definitions used across the Billwave ecosystem, including the Core SDK, CLI, and API.

## Installation

```bash
npm install @digvijay-x1/types
```

## Features

- **Core Configuration**: Types for SDK initialization and environment settings.
- **API Parameters & Results**: Request and response types for all Billwave endpoints (attach, check, track, etc.).
- **Catalog Definitions**: Types for declarative plan and feature configuration.
- **Database Models**: Interfaces for customers, subscriptions, entitlements, and usage records.
- **Shared Constants**: Type unions for currencies, billing intervals, and reset periods.

## Usage

You generally do not need to install this package directly if you are using `billwave`, as it is included as a dependency. However, it can be useful for shared utility functions or when building custom integrations.

```ts
import type {
  BillwaveConfig,
  AttachParams,
  CheckResult,
  CreditsBalanceDetails,
} from "@digvijay-x1/types";
```

`CheckResult` and `TrackResult` expose canonical credit-backed balance state via `credits`, which is `null` for non-credit features and otherwise resolves to either a `credit_system` or `prepaid` shape.

## License

Apache-2.0
