import { performOCR } from "./ocr";
import { extractTextFromPDF } from "./pdf";
import { KiraaState } from "@/lib/schemas/state";

export { performOCR, extractTextFromPDF };

/**
 * Universal document ingestion router.
 * Processes uploaded files based on their MIME type.
 * Maps to Node 1 (Ingestor) in the LangGraph topology.
 */
export async function processUploadedFiles(state: KiraaState): Promise<Partial<KiraaState>> {
  if (!state.uploadedFiles || state.uploadedFiles.length === 0) {
    return { extractedContent: {} };
  }

  const extractedContent: Record<string, any> = {};
  let overallOcrConfidence = 0;
  let ocrCount = 0;
  let needsHumanReview = state.needsHumanReview;
  const errors = [...state.errors];
  const escalationReasons = [...state.escalationReasons];
  let newParams = { ...state.params };

  for (const file of state.uploadedFiles) {
    const { name, type, buffer, content } = file;

    // If it's plain text or JSON, just pass it through
    if (type === "application/json" || type === "text/plain") {
      const textContent = content || (buffer ? buffer.toString("utf-8") : "");
      extractedContent[name] = textContent;
      
      if (type === "application/json") {
        try {
          const parsed = JSON.parse(textContent);
          if (parsed && typeof parsed === "object") {
            newParams = { ...newParams, ...parsed };
          }
        } catch (e) {
          errors.push(`Failed to parse JSON file: ${name}`);
        }
      }
      continue;
    }

    // Process PDF
    if (type === "application/pdf") {
      if (buffer) {
        const result = await extractTextFromPDF(buffer);
        extractedContent[name] = {
          text: result.text,
          mode: result.mode,
          confidence: result.confidence,
        };
        if (result.needsHumanReview) {
          needsHumanReview = true;
          escalationReasons.push(...result.errors);
        }
        if (result.errors.length > 0) {
          errors.push(...result.errors);
        }
      } else {
        extractedContent[name] = { text: content, mode: "passthrough", confidence: 100 };
      }
      continue;
    }

    // Process Image (OCR)
    if (type.startsWith("image/")) {
      if (buffer) {
        const { text, confidence } = await performOCR(buffer);
        extractedContent[name] = { text, confidence };
        overallOcrConfidence += confidence;
        ocrCount++;
        // Low OCR confidence triggers human review
        if (confidence < 85) {
          needsHumanReview = true;
          escalationReasons.push(`OCR confidence for "${name}" is ${confidence}% (threshold: 85%).`);
        }
      } else {
        extractedContent[name] = { text: content, confidence: 100 };
      }
      continue;
    }

    // Unknown file type
    extractedContent[name] = { text: `[Unsupported file format: ${type}]`, confidence: 0 };
    errors.push(`Unsupported file type: ${type} for file "${name}".`);
  }

  return {
    extractedContent,
    ocrConfidence: ocrCount > 0 ? Math.round(overallOcrConfidence / ocrCount) : 100,
    needsHumanReview,
    errors,
    escalationReasons,
    params: newParams,
  };
}

