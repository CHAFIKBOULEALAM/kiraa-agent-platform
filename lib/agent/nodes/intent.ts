import { KiraaState } from "@/lib/schemas/state";
import { z } from "zod";
import { ChatGroq } from "@langchain/groq";

const IntentOutputSchema = z.object({
  intent: z.enum([
    "check_availability",
    "calculate_total_cost",
    "validate_eligibility",
    "make_reservation",
    "policy_query",
    "human_escalation",
    "out_of_scope",
  ]),
  confidence: z.number().min(0).max(1),
  extractedParams: z.record(z.any()).default({}),
});

const groqModel = new ChatGroq({
  model: process.env.LLM_MODEL || process.env.GROQ_MODEL || "qwen/qwen3.8-27b",
  temperature: 0,
});

const intentModel = groqModel.withStructuredOutput(IntentOutputSchema, {
  name: "determine_intent",
});

export async function intentNode(state: KiraaState): Promise<Partial<KiraaState>> {
  console.log("-> [Node] Intent");

  if (state.intentOverride) {
    return {
      intent: state.intentOverride,
      intentConfidence: 1.0,
      graphTrace: [...state.graphTrace, "intent"],
    };
  }

  try {
    const response = await intentModel.invoke([
      {
        role: "system",
        content: `You are Kiraa, an intelligent car rental assistant. 
Determine the primary intent of the user's message.
Extract any relevant parameters like vehicle category, dates, or numbers into extractedParams.
If the request is unrelated to car rentals (e.g. asking for code, recipes, unrelated facts), MUST return 'out_of_scope'.
If the user demands a human agent, return 'human_escalation'.`,
      },
      {
        role: "user",
        content: state.rawInput,
      }
    ]);

    return {
      intent: response.intent,
      intentConfidence: response.confidence,
      params: {
        ...state.params,
        ...response.extractedParams,
      },
      graphTrace: [...state.graphTrace, "intent"],
    };
  } catch (error) {
    console.error("Intent LLM Error:", error);
    return {
      intent: "out_of_scope", // Safe fallback
      errors: [...state.errors, "Failed to determine intent."],
      graphTrace: [...state.graphTrace, "intent"],
    };
  }
}
