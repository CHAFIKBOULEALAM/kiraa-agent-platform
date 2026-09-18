import { StateGraph, END, MemorySaver } from "@langchain/langgraph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { KiraaState, Intent } from "@/lib/schemas/state";

// Nodes
import { ingestorNode } from "./nodes/ingestor";
import { extractorNode } from "./nodes/extractor";
import { intentNode } from "./nodes/intent";
import { validatorNode } from "./nodes/validator";
import { calculatorNode } from "./nodes/calculator";
import { explainerNode } from "./nodes/explainer";
import { reporterNode } from "./nodes/reporter";

// LangGraph uses a reducer mapping for state, but since our nodes return Partial<KiraaState>
// and we just want to merge, we can define the channels.
const graphChannels = {
  requestId: { value: (a: string, b?: string) => b ?? a, default: () => "req_" + Date.now() },
  rawInput: { value: (a: string, b?: string) => b ?? a, default: () => "" },
  uploadedFiles: { value: (a: any[], b?: any[]) => b ?? a, default: () => [] },
  messages: { value: (a: any[], b?: any[]) => a.concat(b || []), default: () => [] },
  intent: { value: (a: Intent | null, b?: Intent | null) => b ?? a, default: () => null },
  intentConfidence: { value: (a: number, b?: number) => b ?? a, default: () => 0 },
  intentOverride: { value: (a: Intent | null, b?: Intent | null) => b ?? a, default: () => null },
  params: { value: (a: any, b?: any) => ({ ...a, ...b }), default: () => ({}) },
  extractedContent: { value: (a: any, b?: any) => ({ ...a, ...b }), default: () => ({}) },
  ocrConfidence: { value: (a: number, b?: number) => b ?? a, default: () => 0 },
  eligibilityResult: { value: (a: any, b?: any) => b ?? a, default: () => null },
  priceResult: { value: (a: any, b?: any) => b ?? a, default: () => null },
  bookingStatus: { value: (a: string | null, b?: string | null) => b ?? a, default: () => null },
  ragPassages: { value: (a: any[], b?: any[]) => b ?? a, default: () => [] },
  validation: { value: (a: any, b?: any) => ({ ...a, ...b }), default: () => ({}) },
  needsHumanReview: { value: (a: boolean, b?: boolean) => b ?? a, default: () => false },
  escalationReasons: { value: (a: string[], b?: string[]) => b ?? a, default: () => [] },
  errors: { value: (a: string[], b?: string[]) => b ?? a, default: () => [] },
  explanation: { value: (a: string, b?: string) => b ?? a, default: () => "" },
  report: { value: (a: string | null, b?: string | null) => b ?? a, default: () => null },
  pdfReportBase64: { value: (a: string | null, b?: string | null) => b ?? a, default: () => null },
  graphTrace: { value: (a: string[], b?: string[]) => b ?? a, default: () => [] },
};

export const agentGraph = new StateGraph<KiraaState>({ channels: graphChannels })
  .addNode("ingestor", ingestorNode as any)
  .addNode("intentDetector", intentNode as any)
  .addNode("validator", validatorNode as any)
  .addNode("calculator", calculatorNode as any)
  .addNode("explainer", explainerNode as any)
  .addNode("reporter", reporterNode as any)
  
  // Linear base path
  .addEdge("__start__", "ingestor")
  .addEdge("ingestor", "intentDetector")

  // Conditional Routing based on intent
  .addConditionalEdges(
    "intentDetector",
    ((state: KiraaState) => {
      const intent = state.intent;
      if (intent === "out_of_scope" || intent === "human_escalation" || state.bookingStatus === "MISSING_DETAILS") {
        return "explainer"; // Skip logic
      }
      return "validator";
    }) as any,
    {
      validator: "validator",
      explainer: "explainer",
    }
  )

  .addEdge("validator", "calculator")
  .addEdge("calculator", "explainer")
  .addEdge("explainer", "reporter")
  .addEdge("reporter", END);

// Initialize PostgresSaver if environment supports it
let postgresSaver: any = null;
try {
  if (process.env.DATABASE_URL) {
    postgresSaver = PostgresSaver.fromConnString(process.env.DATABASE_URL);
  }
} catch (e) {
  console.warn("Failed to init PostgresSaver", e);
}

// NOTE: Production checkpointing MUST use PostgresSaver. MemorySaver is strictly forbidden here.
export const createAgent = () => {
  if (!process.env.DATABASE_URL || !postgresSaver) {
    throw new Error("DATABASE_UNAVAILABLE: LangGraph checkpoint persistence requires PostgreSQL.");
  }
  return agentGraph.compile({ checkpointer: postgresSaver as any });
};

