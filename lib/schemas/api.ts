import { z } from "zod";

/** Chat API request body */
export const ChatRequestSchema = z.object({
  message: z.string().min(1, "Message is required"),
  requestId: z.string().optional(),
  intentOverride: z.string().optional(),
  params: z.record(z.any()).optional(),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

/** Chat API response body */
export const ChatResponseSchema = z.object({
  requestId: z.string(),
  intent: z.string().nullable(),
  explanation: z.string(),
  eligibilityResult: z.any().nullable(),
  priceResult: z.any().nullable(),
  bookingStatus: z.string().nullable(),
  needsHumanReview: z.boolean(),
  escalationReasons: z.array(z.string()),
  errors: z.array(z.string()),
  graphTrace: z.array(z.string()),
  ragPassages: z.array(z.object({
    content: z.string(),
    score: z.number(),
  })),
});
export type ChatResponse = z.infer<typeof ChatResponseSchema>;

/** Health check response */
export const HealthResponseSchema = z.object({
  status: z.enum(["ok", "error"]),
  database: z.enum(["connected", "disconnected"]),
  timestamp: z.string(),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
