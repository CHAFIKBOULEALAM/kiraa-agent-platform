import { z } from "zod";

/** 7 supported intents */
export const IntentEnum = z.enum([
  "check_availability",
  "calculate_total_cost",
  "validate_eligibility",
  "make_reservation",
  "policy_query",
  "human_escalation",
  "out_of_scope",
]);
export type Intent = z.infer<typeof IntentEnum>;

/** Eligibility result from the deterministic engine */
export const EligibilityResultSchema = z.object({
  eligible: z.boolean(),
  age: z.number(),
  licenseSeniorityYears: z.number(),
  licenseExpired: z.boolean(),
  riskCategory: z.string(),
  needsHumanReview: z.boolean(),
  rejectionReasons: z.array(z.string()).default([]),
});
export type EligibilityResult = z.infer<typeof EligibilityResultSchema>;

/** Price result from the deterministic engine */
export const PriceResultSchema = z.object({
  baseDailyRate: z.number(),
  days: z.number(),
  seasonalMultiplier: z.number(),
  insuranceCost: z.number(),
  deposit: z.number(),
  discountAmount: z.number(),
  discountRate: z.number().optional(),
  cappedDiscountRate: z.number().optional(),
  discountCode: z.string().nullable().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  total: z.number().optional(),
  subtotal: z.number().optional(),
  totalPrice: z.number().optional(),
});
export type PriceResult = z.infer<typeof PriceResultSchema>;

/** Full agent state — shared across all 7 nodes */
export const KiraaStateSchema = z.object({
  // Input
  requestId: z.string(),
  rawInput: z.string(),
  uploadedFiles: z.array(z.object({
    name: z.string(),
    type: z.string(),
    content: z.string().optional(),
    buffer: z.any().optional(),
  })).default([]),

  // Conversation History
  messages: z.array(z.any()).default([]),

  // Intent
  intent: IntentEnum.nullable().default(null),
  intentConfidence: z.number().default(0),
  intentOverride: IntentEnum.nullable().default(null),

  // Extraction
  params: z.record(z.any()).default({}),
  extractedContent: z.record(z.any()).default({}),
  ocrConfidence: z.number().default(0),

  // Engine results
  eligibilityResult: EligibilityResultSchema.nullable().default(null),
  priceResult: PriceResultSchema.nullable().default(null),
  bookingStatus: z.string().nullable().default(null),

  // RAG
  ragPassages: z.array(z.object({
    content: z.string(),
    score: z.number(),
  })).default([]),

  // Validation & escalation
  validation: z.record(z.any()).default({}),
  needsHumanReview: z.boolean().default(false),
  escalationReasons: z.array(z.string()).default([]),

  // Errors
  errors: z.array(z.string()).default([]),

  // Output
  explanation: z.string().default(""),
  report: z.string().nullable().default(null),
  pdfReportBase64: z.string().nullable().default(null),

  // Tracing
  graphTrace: z.array(z.string()).default([]),
});

export type KiraaState = z.infer<typeof KiraaStateSchema>;
