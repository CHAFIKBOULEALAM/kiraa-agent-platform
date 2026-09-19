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
    vehicleName: z.string().nullable().optional().describe("A vehicle mention, e.g. Peugeot 208, Dassia, Golf, etc."),
    startDate: z.string().nullable().optional().describe("Rental start date YYYY-MM-DD"),
    endDate: z.string().nullable().optional().describe("Rental end date YYYY-MM-DD"),
    driverAge: z.number().nullable().optional().describe("Age of the driver if mentioned"),
    licenseIssueDate: z.string().nullable().optional().describe("License issue date YYYY-MM-DD"),
    licenseExpiryDate: z.string().nullable().optional().describe("License expiry date YYYY-MM-DD"),
    discountCode: z.string().nullable().optional().describe("Any discount code mentioned"),
    name: z.string().nullable().optional(),
    idNumber: z.string().nullable().optional(),
  }).strict().nullable().optional().default({}),
}).strict();

const groqModel = new ChatGroq({
  model: process.env.LLM_MODEL || process.env.GROQ_MODEL || "llama-3.1-8b-instant",
  temperature: 0,
});

const intentModel = groqModel.withStructuredOutput(IntentOutputSchema, {
  name: "determine_intent",
  strict: true,
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

    const messagesContext = (state.messages || [])
      .slice(-6)
      .map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join("\n");

    const response = await intentModel.invoke([
      {
        role: "system",
        content: `You are Kiraa, an intelligent car rental assistant. 
Determine the primary intent of the user's message.
Extract any relevant parameters into extractedParams (vehicleName, startDate, endDate, driverAge, licenseIssueDate, licenseExpiryDate, discountCode).
If the user mentions a vehicle name (e.g. Dassi, Dacia, Peugeot, Golf, Audi) or wants to rent a car, extract the vehicle to 'vehicleName' and return 'make_reservation'.
If the request is genuinely unrelated to car rentals (e.g. asking for code, recipes, general trivia), MUST return 'out_of_scope'.
If the user demands a human agent, return 'human_escalation'.
If the user asks about policies, cancellation, etc., return 'policy_query'.
If the user is asking to rent, book, or mentions a vehicle with rental intent, return 'make_reservation'.${ocrContext}`,
      },
      {
        role: "user",
        content: `Conversation History:\n${messagesContext}\n\nCurrent Input: ${state.rawInput || "Message vide"}`,
      }
    ]);

    const cleanedParams = Object.fromEntries(
      Object.entries(response.extractedParams || {}).filter(([_, v]) => v !== null)
    );

    // Deterministic Continuation Rule
    if (state.bookingStatus === "MISSING_DETAILS" && response.intent === "out_of_scope" && (state.rawInput || "").length < 100) {
       console.log("-> [Intent] Overriding out_of_scope to make_reservation due to MISSING_DETAILS context.");
       response.intent = "make_reservation";
    }

    // Hallucination Guard
    if (response.extractedParams?.vehicleName) {
      const vName = response.extractedParams.vehicleName;
      if (vName.length > 60 || /\d+\s*(km|ch|portes)/i.test(vName)) {
        console.warn(`-> [Intent] Discarding hallucinated vehicleName: ${vName}`);
        delete response.extractedParams.vehicleName;
      }
    }

    let finalParams: Record<string, any> = {
      ...state.params,
      ...cleanedParams,
    };

    // Attempt deterministic fuzzy match if vehicleName is provided
    if (response.extractedParams && response.extractedParams.vehicleName && !finalParams.vehicleId) {
       const match = await resolveVehicleMention(response.extractedParams.vehicleName);
       if (match) {
          finalParams.vehicleId = match.vehicleId;
          finalParams.make = match.make;
          finalParams.model = match.model;
          finalParams.category = match.category;
          finalParams.baseDailyRate = match.baseDailyRate;
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

       if (missingSlots.length > 0) {
          bookingStatus = "MISSING_DETAILS";
          finalParams.missingSlots = missingSlots;
       } else {
          bookingStatus = "READY_FOR_CALCULATION";
           if (finalParams.driverAge && !finalParams.birthDate) {
             const year = new Date().getFullYear() - finalParams.driverAge;
             finalParams.birthDate = `${year}-01-01`;
          }
          if (finalParams.startDate && finalParams.endDate) {
             const start = new Date(finalParams.startDate);
             const end = new Date(finalParams.endDate);
             const diffTime = Math.abs(end.getTime() - start.getTime());
             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
             finalParams.days = diffDays > 0 ? diffDays : 1;
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
      intent: "INTENT_CLASSIFICATION_FAILED" as any, // Surface the error
      errors: [...state.errors, "Failed to determine intent due to an internal error or rate limit."],
      graphTrace: [...state.graphTrace, "intent"],
    };
  }
}
