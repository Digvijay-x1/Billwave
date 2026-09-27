import { resolve, isAbsolute, extname } from "node:path";
import { existsSync } from "node:fs";
import { createJiti } from "jiti";
import { usageError } from "./errors.js";

const jiti = createJiti(import.meta.url, {
  alias: {
    "@digvijay-x1/billwave": import.meta.resolve("@digvijay-x1/billwave"),
  },
});

export const DEFAULT_CONFIG_NAMES = [
  "billwave.config.ts",
  "billwave.config.js",
  "billwave.config.mjs",
  "billwave.config.mts",
  "billwave.config.cts",
];

export function resolveConfigPath(configPath?: string): string | null {
  if (configPath) {
    const fullPath = isAbsolute(configPath)
      ? configPath
      : resolve(process.cwd(), configPath);

    if (existsSync(fullPath)) return fullPath;
    return null;
  }

  // Try defaults
  for (const name of DEFAULT_CONFIG_NAMES) {
    const fullPath = resolve(process.cwd(), name);
    if (existsSync(fullPath)) return fullPath;
  }

  return null;
}

export async function loadBillwaveFromConfig(fullPath: string): Promise<any> {
  try {
    const configModule: any = await jiti.import(fullPath);

    // Handle named or default ESM exports, giving priority to explicit names.
    const instance = configModule.billwave || configModule.default || configModule;

    if (instance && typeof instance.sync === "function") {
      return instance;
    }
    if (typeof configModule.sync === "function") {
      return configModule;
    }

    return null;
  } catch (e: any) {
    const ext = extname(fullPath);
    const example =
      ext === ".ts" || ext === ".mts" || ext === ".cts"
        ? "billwave.config.ts"
        : "billwave.config.js";
    throw usageError(
      "config_invalid",
      `Failed to load config from ${fullPath}: ${e.message}`,
      `The file must export a Billwave instance as default or named 'billwave'. Example ${example}:\n` +
        `  import { Billwave, metered, boolean, entity, creditSystem, creditPack, plan } from "@digvijay-x1/billwave";\n` +
        `  export const billwave = new Billwave({ secretKey: "...", catalog: [...] });`,
    );
  }
}

export interface ConfigSettings {
  apiUrl?: string;
  environments?: { test?: string; live?: string };
  filters?: {
    group?: string;
    interval?: string;
    currency?: string;
    includeInactive?: boolean;
  };
  connect?: {
    dashboardUrl?: string;
    autoOpenBrowser?: boolean;
    timeout?: number;
  };
}

export async function loadConfigSettings(
  configPath?: string,
): Promise<ConfigSettings> {
  try {
    const fullPath = resolveConfigPath(configPath);
    if (!fullPath) return {};
    const billwave = await loadBillwaveFromConfig(fullPath);
    if (!billwave || !billwave._config) return {};
    return {
      apiUrl: billwave._config.apiUrl,
      environments: billwave._config.environments,
      filters: billwave._config.filters,
      connect: billwave._config.connect,
    };
  } catch (e) {
    // If we fail to load the config (e.g. missing billwave package in fresh project),
    // we just return empty settings and let the CLI continue with defaults.
    return {};
  }
}
