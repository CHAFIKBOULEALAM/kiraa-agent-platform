import pdfParse from "pdf-parse";
import { performOCR } from "./ocr";
import { execFile } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";

const NATIVE_TEXT_SUFFICIENCY_THRESHOLD = 50; // chars — below this, PDF is likely scanned

export interface PdfExtractionResult {
  text: string;
  mode: "native" | "ocr_fallback" | "failed";
  confidence: number;
  needsHumanReview: boolean;
  errors: string[];
}

/**
 * Extracts text from a PDF buffer.
 *
 * Strategy:
 *  1. Native text extraction via pdf-parse (fast, accurate for digital PDFs).
 *  2. If extracted text is below NATIVE_TEXT_SUFFICIENCY_THRESHOLD chars,
 *     the PDF is likely scanned/image-based.
 *  3. Scanned PDFs require rendering to images then Tesseract OCR.
 *     This requires a native canvas/poppler library unavailable in the current environment.
 *     In that case, needsHumanReview = true and the caller is informed.
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<PdfExtractionResult> {
  try {
    const data = await pdfParse(pdfBuffer);
    const text = data.text.trim();

    if (text.length >= NATIVE_TEXT_SUFFICIENCY_THRESHOLD) {
      return {
        text,
        mode: "native",
        confidence: 95,
        needsHumanReview: false,
        errors: [],
      };
    }

    // Insufficient text — PDF appears to be scanned/image-based
    console.log(`   [PDF] Insufficient text (${text.length} chars). Falling back to OCR...`);
    
    // Create temporary directory for PDF and images
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "kiraa-pdf-"));
    const tempPdfPath = path.join(tempDir, "temp.pdf");
    await fs.writeFile(tempPdfPath, pdfBuffer);

    try {
      // Run pdftoppm to extract first page as JPEG
      await new Promise<void>((resolve, reject) => {
        execFile("pdftoppm", ["-jpeg", "-f", "1", "-l", "1", tempPdfPath, path.join(tempDir, "page")], (error) => {
          if (error) {
            console.error("pdftoppm error:", error);
            reject(new Error("pdftoppm missing or failed. Is poppler-utils installed?"));
          } else {
            resolve();
          }
        });
      });

      // The image is usually named page-1.jpg
      const imgPath = path.join(tempDir, "page-1.jpg");
      const imgBuffer = await fs.readFile(imgPath);

      const ocrResult = await performOCR(imgBuffer);
      
      return {
        text: ocrResult.text,
        mode: "ocr_fallback",
        confidence: ocrResult.confidence,
        needsHumanReview: ocrResult.confidence < 85,
        errors: [],
      };
    } catch (fallbackError) {
      const msg = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
      return {
        text: text || "[Scanned PDF — text layer absent or insufficient]",
        mode: "ocr_fallback",
        confidence: 0,
        needsHumanReview: true,
        errors: [`Scanned PDF detected but OCR fallback failed: ${msg}`],
      };
    } finally {
      // Clean up temp files
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (e) {
        console.error("Failed to clean up temp dir:", e);
      }
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("PDF Parsing Error:", msg);
    return {
      text: "",
      mode: "failed",
      confidence: 0,
      needsHumanReview: true,
      errors: [`Failed to parse PDF: ${msg}`],
    };
  }
}

