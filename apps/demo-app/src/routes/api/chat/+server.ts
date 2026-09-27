import { json } from "@sveltejs/kit";
import { calculateChatCost, defaultChatModel, getChatModelById } from "$lib/chat-models";
import { billwave } from "$lib/server/billwave";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, cookies }) => {
  const userId = cookies.get("userId");
  if (!userId) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const requestedModelId =
    typeof body.model === "string" ? body.model : defaultChatModel.id;
  const model = getChatModelById(requestedModelId);
  const messages = body.messages || [];

  if (!model) {
    return json(
      {
        error: `Invalid model '${requestedModelId}'. Supported models: gemini, flash, pro.`,
      },
      { status: 400 },
    );
  }

  const modelId = model.id;
  const cost = calculateChatCost(modelId);
  const featureId = "ai-credits";

  try {
    // Check if user is using a premium model but doesn't have access
    if (model.premium) {
      const modelCheck = await billwave.check({
        customer: userId,
        feature: "premium-models",
      });
      if (!modelCheck.allowed) {
        return json(
          {
            error: `Upgrade to Pro to use Premium Models (${modelId}).`,
            allowed: false,
            code: modelCheck.code,
          },
          { status: 403 },
        );
      }
    }

    // 1. Pre-generation access check (billwave.check)
    const check = await billwave.check({
      customer: userId,
      feature: featureId,
      value: cost,
    });

    if (!check.allowed) {
      return json(
        {
          error: `Insufficient credits: ${check.code.replace(/_/g, " ")}. You need ${cost} credits.`,
          allowed: false,
          code: check.code,
        },
        { status: 403 },
      );
    }

    // (Simulation) Pretend we generated a response
    const textResponse = `Simulated response from ${modelId} (${cost} credits). Billwave metered this transaction.`;

    // 2. Post-generation usage tracking (billwave.track)
    await billwave.track({
      customer: userId,
      feature: featureId,
      value: cost,
    });

    const updatedCheck = await billwave.check({
      customer: userId,
      feature: featureId,
      value: 0,
    });

    return json({
      message: textResponse,
      tracked: true,
      cost,
      checkResult: updatedCheck,
    });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};
