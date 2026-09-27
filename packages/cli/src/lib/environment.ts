import { inferModeFromSecretKey, BILLWAVE_HOSTS } from "@digvijay-x1/billwave";
import type { BillwaveMode } from "@digvijay-x1/billwave";
import { usageError } from "./errors.js";

export type { BillwaveMode };

/**
 * The CLI uses the same single word as the SDK — `mode` — for the
 * environment: "sandbox" or "live". It is resolved from, in order:
 *
 *   1. --mode <sandbox|live>       (or the deprecated --prod alias for live)
 *   2. BILLWAVE_MODE               environment variable
 *   3. the API key prefix          (billwave_sk_test_… / billwave_sk_live_…)
 *
 * With none of those the command refuses to run rather than guessing. When an
 * explicit mode contradicts the key's scope the command also refuses to run,
 * because the API would reject the request anyway — better to say so before
 * any network call.
 */
export type ModeSource = "flag" | "env" | "key";

export interface ResolvedMode {
  mode: BillwaveMode;
  source: ModeSource;
  /** true when the deprecated --prod alias was used */
  legacyProdFlag: boolean;
}

export interface ResolveModeInput {
  flagMode?: string;
  prod?: boolean;
  envMode?: string;
  apiKey?: string;
}

function parseMode(
  value: string | undefined,
  label: string,
): BillwaveMode | null {
  if (value === undefined || value === "") return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "sandbox" || normalized === "test") return "sandbox";
  if (
    normalized === "live" ||
    normalized === "prod" ||
    normalized === "production"
  )
    return "live";
  throw usageError(
    "missing_mode",
    `Invalid ${label} "${value}". Expected "sandbox" or "live".`,
  );
}

export function resolveMode(input: ResolveModeInput): ResolvedMode {
  const flag = parseMode(input.flagMode, "--mode");
  const fromProd = input.prod ? ("live" as const) : null;
  const env = parseMode(input.envMode, "BILLWAVE_MODE");
  const key = inferModeFromSecretKey(input.apiKey);

  if (flag && fromProd && flag !== fromProd) {
    throw usageError(
      "mode_mismatch",
      `--mode ${flag} and --prod contradict each other. Drop --prod; it is a deprecated alias for --mode live.`,
    );
  }

  const explicit: { mode: BillwaveMode; source: ModeSource } | null = flag
    ? { mode: flag, source: "flag" }
    : fromProd
      ? { mode: fromProd, source: "flag" }
      : env
        ? { mode: env, source: "env" }
        : null;

  if (explicit && key && explicit.mode !== key) {
    const from = explicit.source === "flag" ? "--mode/--prod" : "BILLWAVE_MODE";
    throw usageError(
      "mode_mismatch",
      `${from} selects ${explicit.mode}, but the API key is scoped to ${key} (${
        key === "live" ? "billwave_sk_live_" : "billwave_sk_test_"
      }…). The ${explicit.mode} API would reject it.`,
      `Use a ${explicit.mode} key, or run with --mode ${key}.`,
    );
  }

  if (explicit) {
    return { ...explicit, legacyProdFlag: !flag && !!fromProd };
  }

  if (key) {
    return { mode: key, source: "key", legacyProdFlag: false };
  }

  throw usageError(
    "missing_mode",
    "No environment selected. Pass --mode sandbox or --mode live (or set BILLWAVE_MODE).",
    "Environment-scoped keys (billwave_sk_test_… / billwave_sk_live_…) select the mode automatically.",
  );
}

export interface ResolveApiBaseUrlInput {
  mode: BillwaveMode;
  /** BILLWAVE_API_URL — one knob that overrides the host for the selected mode. */
  envApiUrl?: string;
  /** Deprecated per-mode overrides (BILLWAVE_API_TEST_URL / BILLWAVE_API_LIVE_URL). */
  envTestUrl?: string;
  envLiveUrl?: string;
  /** `environments` from billwave.config.ts */
  configEnvironments?: { test?: string; live?: string };
}

/** Host (no version path) for the selected mode. */
export function resolveApiHost(input: ResolveApiBaseUrlInput): string {
  const { mode } = input;
  const perMode = mode === "live" ? input.envLiveUrl : input.envTestUrl;
  const fromConfig =
    mode === "live"
      ? input.configEnvironments?.live
      : input.configEnvironments?.test;

  return stripTrailingSlash(
    input.envApiUrl || perMode || fromConfig || BILLWAVE_HOSTS[mode],
  );
}

/** Fully-qualified public API base URL the CLI talks to. */
export function resolveApiBaseUrl(input: ResolveApiBaseUrlInput): string {
  return `${resolveApiHost(input)}/api/v1`;
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function describeMode(mode: BillwaveMode): string {
  return mode === "live"
    ? "live (api.billwave.example)"
    : "sandbox (sandbox.billwave.example)";
}
