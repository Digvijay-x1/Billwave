import { Billwave } from "@digvijay-x1/billwave";
import type { BillwaveConfig } from "@digvijay-x1/types";

// Re-export for convenience
export { Billwave } from "@digvijay-x1/billwave";
export type * from "@digvijay-x1/types";

// Svelte stores and utilities
export { billwave, createBillwaveContext } from "./lib/context.svelte.js";
export { useFeatureAccess } from "./lib/use-feature-access.svelte.js";
export { useCustomer } from "./lib/use-customer.svelte.js";

// Components
export { default as PricingTable } from "./components/PricingTable.svelte";
export { default as CheckoutButton } from "./components/CheckoutButton.svelte";
export { default as UsageChart } from "./components/UsageChart.svelte";
