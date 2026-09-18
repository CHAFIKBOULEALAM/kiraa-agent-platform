import { KiraaState } from "@/lib/schemas/state";
import { z } from "zod";
import { ChatGroq } from "@langchain/groq";
import { resolveVehicleMention } from "@/lib/engine/vehicleResolution";

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
  extractedParams: z.object({
    vehicleName: z.string().optional().describe("A vehicle mention, e.g. Peugeot 208, Dassia, Golf, etc."),
    startDate: z.string().optional().describe("Rental start date YYYY-MM-DD"),
    endDate: z.string().optional().describe("Rental end date YYYY-MM-DD"),
    driverAge: z.number().optional().describe("Age of the driver if mentioned"),
    licenseIssueDate: z.string().optional().describe("License issue date YYYY-MM-DD"),
    licenseExpiryDate: z.string().optional().describe("License expiry date YYYY-MM-DD"),
    discountCode: z.string().optional().describe("Any discount code mentioned"),
    name: z.string().optional(),
    idNumber: z.string().optional(),
  }).strict().default({}),
}).strict();

const groqModel = new ChatGroq({
  model: process.env.LLM_MODEL || process.env.GROQ_MODEL || "qwen/qwen3.8-27b",
  temperature: 0,
});

const intentModel = groqModel.withStructuredOutput(IntentOutputSchema, {
  name: "determine_intent",
});

export async function intentNode(state: KiraaState): Promise<Partial<KiraaState>> {
  console.log("-> [Node] Intent & Extractor (Merged)");

  if (state.intentOverride) {
    return {
      intent: state.intentOverride,
      intentConfidence: 1.0,
      graphTrace: [...state.graphTrace, "intent"],
    };
  }

  try {
    // If we have extracted OCR content from documents, append it to the context
    let ocrContext = "";
    const keys = Object.keys(state.extractedContent || {});
    if (keys.length > 0) {
       ocrContext = "\n\nExtracted OCR Data from uploaded documents:\n" + keys.map(k => state.extractedContent[k]).join("\n\n");
    }

    const response = await intentModel.invoke([
      {
        role: "system",
        content: `You are Kiraa, an intelligent car rental assistant. 
Determine the primary intent of the user's message.
Extract any relevant parameters into extractedParams (vehicleName, startDate, endDate, driverAge, licenseIssueDate, licenseExpiryDate, discountCode).
If the user mentions a vehicle name or wants to rent a car, extract the vehicle to 'vehicleName'.
If the request is unrelated to car rentals (e.g. asking for code, recipes, general trivia), MUST return 'out_of_scope'.
If the user demands a human agent, return 'human_escalation'.
If the user is asking to rent, book, or mentions a vehicle with rental intent, return 'make_reservation'.${ocrContext}`,
      },
      {
        role: "user",
        content: state.rawInput || "Message vide",
      }
    ]);

    let finalParams: Record<string, any> = {
      ...state.params,
      ...(response.extractedParams || {}),
    };

    // Attempt deterministic fuzzy match if vehicleName is provided
    if (response.extractedParams && response.extractedParams.vehicleName && !finalParams.vehicleId) {
       const match = await resolveVehicleMention(response.extractedParams.vehicleName);
       if (match) {
          finalParams.vehicleId = match.vehicleId;
          finalParams.make = match.make;
          finalParams.model = match.model;
       } else {
          finalParams.unresolvedVehicle = response.extractedParams.vehicleName;
          delete finalParams.vehicleId;
       }
    }

    let bookingStatus = state.bookingStatus;
    let missingSlots: string[] = [];

    if (response.intent === "make_reservation" || response.intent === "check_availability") {
       if (!finalParams.vehicleId) missingSlots.push("le modèle du véhicule souhaité");
       if (!finalParams.startDate) missingSlots.push("la date de début de location");
       if (!finalParams.endDate) missingSlots.push("la date de fin de location");
       if (!finalParams.driverAge) missingSlots.push("votre âge");
       if (!finalParams.licenseIssueDate) missingSlots.push("la date de délivrance de votre permis");
       if (!finalParams.licenseExpiryDate) missingSlots.push("la date d'expiration de votre permis");

       if (missingSlots.length > 0) {
          bookingStatus = "MISSING_DETAILS";
          finalParams.missingSlots = missingSlots;
       } else {
          bookingStatus = "READY_FOR_CALCULATION";
          if (finalParams.driverAge && !finalParams.birthDate) {
             const year = new Date().getFullYear() - finalParams.driverAge;
             finalParams.birthDate = `${year}-01-01`;
          }
       }
    }

    return {
      intent: response.intent,
      intentConfidence: response.confidence,
      params: finalParams,
      bookingStatus,
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
