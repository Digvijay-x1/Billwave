import { join } from "node:path";
import { homedir } from "node:os";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import type { BillwaveMode } from "./environment.js";
import { usageError } from "./errors.js";

export const GLOBAL_CONFIG_DIR = join(homedir(), ".billwave");
export const GLOBAL_CONFIG_PATH = join(GLOBAL_CONFIG_DIR, "config.json");

export interface GlobalConfig {
  /**
   * @deprecated single key from before environment scoping. Still honoured as
   * a fallback for either mode; `billwave connect` now writes `keys` instead.
   */
  apiKey?: string;
  /** Environment-scoped keys written by `billwave connect`. */
  keys?: Partial<Record<BillwaveMode, string>>;
  organizationId?: string;
}

export function getDashboardUrl(configUrl?: string): string {
  return (
    process.env.BILLWAVE_DASHBOARD_URL ||
    configUrl ||
    "https://app.billwave.example"
  );
}

export async function saveGlobalConfig(data: GlobalConfig): Promise<void> {
  if (!existsSync(GLOBAL_CONFIG_DIR)) {
    mkdirSync(GLOBAL_CONFIG_DIR, { recursive: true });
  }
  await writeFile(GLOBAL_CONFIG_PATH, JSON.stringify(data, null, 2), "utf8");
}

export function loadGlobalConfig(): GlobalConfig {
  try {
    if (existsSync(GLOBAL_CONFIG_PATH)) {
      return JSON.parse(readFileSync(GLOBAL_CONFIG_PATH, "utf8"));
    }
  } catch {}
  return {};
}

/**
 * Pick the API key for a command, in order:
 *   --key  >  BILLWAVE_SECRET_KEY  >  BILLWAVE_API_KEY  >  ~/.billwave/config.json
 *
 * The stored config may hold one key per mode (from `billwave connect`); when the
 * mode is known the matching one is used, otherwise the legacy single key.
 * Returns "" when nothing is configured so callers can decide how to fail.
 */
export function getApiKey(cliKey?: string, mode?: BillwaveMode): string {
  if (cliKey) return cliKey;
  if (process.env.BILLWAVE_SECRET_KEY) return process.env.BILLWAVE_SECRET_KEY;
  if (process.env.BILLWAVE_API_KEY) return process.env.BILLWAVE_API_KEY;

  const stored = loadGlobalConfig();
  if (mode && stored.keys?.[mode]) return stored.keys[mode]!;
  return stored.apiKey || "";
}

export function requireApiKey(cliKey?: string, mode?: BillwaveMode): string {
  const apiKey = getApiKey(cliKey, mode);
  if (apiKey) return apiKey;
  throw usageError(
    "missing_api_key",
    `Missing API key${mode ? ` for ${mode}` : ""}. Pass --key, set BILLWAVE_SECRET_KEY, or run \`billwave connect\`.`,
  );
}
