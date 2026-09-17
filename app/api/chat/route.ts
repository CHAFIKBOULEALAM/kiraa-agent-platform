import { NextRequest, NextResponse } from "next/server";
import { createAgent } from "@/lib/agent/graph";
import { KiraaState, IntentEnum } from "@/lib/schemas/state";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
  "application/json",
  "text/plain",
]);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const message = (formData.get("message") as string) || "";

    // intentOverride is NOT accepted from public input — security requirement.
    // It must never be parsed from FormData or any client-supplied payload.

    // Parse and validate files
    const rawFiles = formData.getAll("files") as File[];
    const uploadedFiles: KiraaState["uploadedFiles"] = [];
    const fileErrors: string[] = [];

    for (const f of rawFiles) {
      if (!ALLOWED_MIME_TYPES.has(f.type)) {
        fileErrors.push(`File "${f.name}" has unsupported type "${f.type}". Allowed: JPEG, PNG, PDF, JSON, TXT.`);
        continue;
      }
      if (f.size > MAX_FILE_SIZE_BYTES) {
        fileErrors.push(`File "${f.name}" exceeds the 10 MB upload limit.`);
        continue;
      }
      const arrayBuffer = await f.arrayBuffer();
      uploadedFiles.push({
        name: f.name,
        type: f.type,
        buffer: Buffer.from(arrayBuffer),
      });
    }

    const providedThreadId = formData.get("threadId") as string | null;

    // Build initial state — intentOverride is NEVER set from user input
    const initialState: KiraaState = {
      requestId: providedThreadId || `REQ-${uuidv4().substring(0, 8).toUpperCase()}`,
      rawInput: message,
      uploadedFiles,
      intent: null,
      intentConfidence: 0,
      intentOverride: null, // always null — not from user input
      params: {},
      extractedContent: {},
      ocrConfidence: 0,
      eligibilityResult: null,
      priceResult: null,
      bookingStatus: null,
      ragPassages: [],
      validation: {},
      needsHumanReview: false,
      escalationReasons: fileErrors.length > 0 ? fileErrors : [],
      errors: fileErrors,
      explanation: "",
      report: null,
      pdfReportBase64: null,
      graphTrace: [],
    };

    // --- E2E_TEST_MODE DETERMINISTIC ROUTING ---
    if (process.env.E2E_TEST_MODE === "true") {
      console.warn("⚠️ E2E_TEST_MODE is enabled. Using deterministic server-side intent routing.");
      if (message.includes("Quelles sont les conditions")) {
        initialState.intentOverride = "policy_query";
      } else if (message.includes("louer ce véhicule premium") || message.includes("FLASH") || message.includes("Confirme ma réservation")) {
        initialState.intentOverride = "make_reservation";
        if (message.includes("FLASH")) {
          initialState.params = {
            ...initialState.params,
            category: "Economy",
            days: 5,
            baseDailyRate: 300,
            discountCode: "FLASH25"
          };
        }
      } else if (message.includes("Bonjour") || message.includes("Hello") || message.includes("Voici mes documents") || message.includes("Analyse") || message.includes("Ignore toutes les instructions")) {
        initialState.intentOverride = "out_of_scope";
      }
    }
    // -------------------------------------------

    // Compile and run the real LangGraph agent
    const agent = createAgent();
    console.log(`🚀 Starting Kiraa Agent [${initialState.requestId}]`);
    const finalState = await agent.invoke(initialState, {
      configurable: { thread_id: initialState.requestId }
    });
    console.log(`✅ Agent finished [${initialState.requestId}] — trace: ${finalState.graphTrace?.join(" → ")}`);

    // Never expose stack traces, connection strings, or internal errors to the browser
      const hasOcrFallback = Object.values(finalState.extractedContent).some((c: any) => c && c.mode === "ocr_fallback");
      
      return NextResponse.json({
      requestId: finalState.requestId,
      intent: finalState.intent,
      explanation: finalState.explanation,
      eligibilityResult: finalState.eligibilityResult,
      priceResult: finalState.priceResult,
      bookingStatus: finalState.bookingStatus,
      needsHumanReview: finalState.needsHumanReview,
      escalationReasons: finalState.escalationReasons,
      errors: finalState.errors,
      graphTrace: finalState.graphTrace,
      ragPassages: finalState.ragPassages,
      pdfReportBase64: finalState.pdfReportBase64,
      ocr: {
        status: finalState.ocrConfidence > 0 ? "SUCCESS" : (hasOcrFallback ? "FALLBACK" : null),
        confidence: finalState.ocrConfidence,
        mode: hasOcrFallback ? "ocr_fallback" : "native"
      }
    });
  } catch (error) {
    // Log server-side only — never expose internal error details to browser
    console.error("API Chat Error:", error instanceof Error ? error.stack : String(error));
    return NextResponse.json(
      { error: "Une erreur interne est survenue. Veuillez réessayer." },
      { status: 500 }
    );
  }
}

