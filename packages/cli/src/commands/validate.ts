import * as p from "@clack/prompts";
import pc from "picocolors";
import { loadBillwaveFromConfig, resolveConfigPath } from "../lib/loader.js";
import { fetchPlans } from "../lib/api.js";
import {
  announceMode,
  resolveCommandContext,
  type CommonCommandOptions,
} from "../lib/context.js";
import { failure, usageError } from "../lib/errors.js";
import type { Reporter } from "../lib/output.js";

export type ValidateOptions = CommonCommandOptions;

export async function runValidate(
  options: ValidateOptions,
  reporter: Reporter,
) {
  reporter.intro("validate");

  const fullPath = resolveConfigPath(options.config);

  if (!fullPath) {
    throw usageError("config_not_found", "No configuration file found.");
  }

  const s = p.spinner();

  s.start(`Loading ${pc.cyan(fullPath)}`);
  let billwave: any;
  try {
    billwave = await loadBillwaveFromConfig(fullPath);
  } catch (e: any) {
    s.stop(pc.red("Failed to load configuration"));
    throw usageError(
      "config_invalid",
      `Could not load ${fullPath}: ${e.message}`,
      "Make sure '@digvijay-x1/billwave' is installed in your project: npm install @digvijay-x1/billwave",
    );
  }

  if (!billwave || typeof billwave.sync !== "function") {
    s.stop(pc.red("Invalid configuration"));
    throw usageError(
      "config_invalid",
      "Config file must export a Billwave instance.",
    );
  }

  if (!billwave._config?.catalog || billwave._config.catalog.length === 0) {
    s.stop(pc.red("No catalog found"));
    throw usageError("config_invalid", "Config has no catalog to validate.");
  }

  s.stop(
    pc.green(`Configuration loaded (${billwave._config.catalog.length} entries)`),
  );

  const { buildSyncPayload } = (await import("@digvijay-x1/billwave").catch(() => ({
    buildSyncPayload: null,
  }))) as any;

  if (!buildSyncPayload) {
    throw usageError(
      "config_invalid",
      "buildSyncPayload unavailable from billwave. Upgrade the billwave package.",
    );
  }

  try {
    const payload = buildSyncPayload(billwave._config.catalog);

    p.log.step(pc.bold("Features"));
    for (const f of payload.features) {
      p.log.message(`${pc.green("✓")} ${f.slug} ${pc.dim(`(${f.type})`)}`);
    }

    if (payload.creditSystems && payload.creditSystems.length > 0) {
      p.log.step(pc.bold("Credit Systems"));
      for (const cs of payload.creditSystems) {
        p.log.message(
          `${pc.green("✓")} ${pc.bold(cs.slug)} ${pc.dim(`(${cs.features.length} features)`)}`,
        );
      }
    }

    p.log.step(pc.bold("Plans"));
    for (const p_obj of payload.plans) {
      p.log.message(
        `${pc.green("✓")} ${p_obj.isAddon ? pc.cyan("(addon)") : ""} ${pc.bold(p_obj.slug)} ${pc.dim(`${p_obj.currency} ${p_obj.price} / ${p_obj.interval}`)}`,
      );
    }

    // Connectivity check against the selected environment. Missing key/mode
    // is a usage error; an unreachable/denied API is a validation failure.
    const ctx = await resolveCommandContext(options, reporter);
    announceMode(reporter, ctx, "checking");
    try {
      const remotePlans = await fetchPlans({
        apiKey: ctx.apiKey,
        apiUrl: ctx.apiUrl,
      });
      p.log.success(
        `${ctx.mode} environment accessible (${remotePlans.length} remote plans)`,
      );
    } catch (e: any) {
      throw failure(
        "api_error",
        `${ctx.mode} environment check failed: ${e.message}`,
      );
    }

    p.outro(pc.green("Validation passed! ✨"));
  } catch (e: any) {
    if (e?.name === "CliError") throw e;
    throw failure("api_error", `Validation failed: ${e.message}`);
  }
}
