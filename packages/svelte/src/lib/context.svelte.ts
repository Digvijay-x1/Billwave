import { Billwave } from "@digvijay-x1/billwave";
import type { BillwaveConfig } from "@digvijay-x1/types";
import { getContext, setContext } from "svelte";

const BILLWAVE_CONTEXT_KEY = Symbol("billwave");

/**
 * Create Billwave context for Svelte app
 *
 * @example
 * ```svelte
 * <script>
 *   import { createBillwaveContext } from '@digvijay-x1/svelte';
 *
 *   createBillwaveContext({
 *     secretKey: import.meta.env.VITE_PAYSTACK_SECRET_KEY
 *   });
 * </script>
 * ```
 */
export function createBillwaveContext(config: BillwaveConfig): Billwave {
  const billwave = new Billwave(config);
  setContext(BILLWAVE_CONTEXT_KEY, billwave);
  return billwave;
}

/**
 * Get Billwave instance from context
 */
export function billwave(): Billwave {
  const billwave = getContext<Billwave>(BILLWAVE_CONTEXT_KEY);
  if (!billwave) {
    throw new Error(
      "Billwave context not found. Did you call createBillwaveContext()?",
    );
  }
  return billwave;
}
