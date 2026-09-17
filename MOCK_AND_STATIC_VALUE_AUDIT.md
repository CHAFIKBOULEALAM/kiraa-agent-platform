# Mock and Static Value Audit

| File | Line | Term Found | Context | Classification |
|---|---|---|---|---|
| app\api\chat\route.ts | 68 | pdfReportBase64 | pdfReportBase64: null, | REQUIRES_MANUAL_REVIEW |
| app\api\chat\route.ts | 72 | E2E_TEST_MODE | // --- E2E_TEST_MODE DETERMINISTIC ROUTING --- | REQUIRES_MANUAL_REVIEW |
| app\api\chat\route.ts | 73 | E2E_TEST_MODE | if (process.env.E2E_TEST_MODE === "true") { | REQUIRES_MANUAL_REVIEW |
| app\api\chat\route.ts | 74 | E2E_TEST_MODE | console.warn("⚠️ E2E_TEST_MODE is enabled. Using deterministic server-side intent routing."); | REQUIRES_MANUAL_REVIEW |
| app\api\chat\route.ts | 106 | pdfReportBase64 | pdfReportBase64: finalState.pdfReportBase64, | REQUIRES_MANUAL_REVIEW |
| lib\agent\graph.ts | 1 | MemorySaver | import { StateGraph, END, MemorySaver } from "@langchain/langgraph"; | REQUIRES_MANUAL_REVIEW |
| lib\agent\graph.ts | 36 | pdfReportBase64 | pdfReportBase64: { value: (a: string | null, b?: string | null) => b ?? a, default: () => null }, | REQUIRES_MANUAL_REVIEW |
| lib\agent\graph.ts | 85 | MemorySaver | // NOTE: Production checkpointing MUST use PostgresSaver. MemorySaver is strictly forbidden here. | REQUIRES_MANUAL_REVIEW |
| lib\agent\nodes\reporter.ts | 40 | pdfReportBase64 | let pdfReportBase64 = null; | REQUIRES_MANUAL_REVIEW |
| lib\agent\nodes\reporter.ts | 42 | pdfReportBase64 | pdfReportBase64 = await new Promise<string>((resolve, reject) => { | REQUIRES_MANUAL_REVIEW |
| lib\agent\nodes\reporter.ts | 89 | pdfReportBase64 | pdfReportBase64, | REQUIRES_MANUAL_REVIEW |
| lib\rag\index.ts | 31 | dummy | // Note: If using dummy zero vectors, cosine distance will be 0 or NaN. | REQUIRES_MANUAL_REVIEW |
| lib\schemas\state.ts | 90 | pdfReportBase64 | pdfReportBase64: z.string().nullable().default(null), | REQUIRES_MANUAL_REVIEW |
| components\ChatUI.tsx | 249 | pdfReportBase64 | {msg.metadata.pdfReportBase64 && ( | REQUIRES_MANUAL_REVIEW |
| components\ChatUI.tsx | 252 | pdfReportBase64 | href={`data:application/pdf;base64,${msg.metadata.pdfReportBase64}`} | REQUIRES_MANUAL_REVIEW |
| components\ChatUI.tsx | 331 | placeholder | placeholder="Posez votre question ou uploadez vos documents..." | REQUIRES_MANUAL_REVIEW |
| components\ChatUI.tsx | 332 | placeholder | className="flex-1 max-h-32 min-h-[44px] bg-transparent border-0 focus:ring-0 resize-none py-3 px-2 t | REQUIRES_MANUAL_REVIEW |
| tests\engine.test.ts | 9 | mock | vi.mock("@/db", () => ({ | REQUIRES_MANUAL_REVIEW |
| tests\engine.test.ts | 197 | mock | it("T13: Véhicule disponible (mock DB empty)", async () => { | REQUIRES_MANUAL_REVIEW |
| tests\e2e\chat.spec.ts | 14 | placeholder | const input = page.locator('textarea[placeholder*="Posez votre question"]'); | REQUIRES_MANUAL_REVIEW |
| tests\e2e\chat.spec.ts | 31 | placeholder | const input = page.locator('textarea[placeholder*="Posez votre question"]'); | REQUIRES_MANUAL_REVIEW |
| tests\e2e\chat.spec.ts | 50 | placeholder | const input = page.locator('textarea[placeholder*="Posez votre question"]'); | REQUIRES_MANUAL_REVIEW |
| tests\e2e\chat.spec.ts | 65 | scanned_document.pdf | await fileChooser.setFiles(path.resolve(__dirname, '../../samples/scanned_document.pdf')); | REQUIRES_MANUAL_REVIEW |
| tests\e2e\chat.spec.ts | 67 | placeholder | const input = page.locator('textarea[placeholder*="Posez votre question"]'); | REQUIRES_MANUAL_REVIEW |
| tests\e2e\chat.spec.ts | 79 | placeholder | const input = page.locator('textarea[placeholder*="Posez votre question"]'); | REQUIRES_MANUAL_REVIEW |
| tests\e2e\chat.spec.ts | 91 | placeholder | const input = page.locator('textarea[placeholder*="Posez votre question"]'); | REQUIRES_MANUAL_REVIEW |
| tests\e2e\chat.spec.ts | 120 | placeholder | const input = page.locator('textarea[placeholder*="Posez votre question"]'); | REQUIRES_MANUAL_REVIEW |
| tests\e2e\chat.spec.ts | 135 | placeholder | const input = page.locator('textarea[placeholder*="Posez votre question"]'); | REQUIRES_MANUAL_REVIEW |
