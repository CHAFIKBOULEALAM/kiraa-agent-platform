import Tesseract from "tesseract.js";

export interface OcrResult {
  text: string;
  confidence: number;
}

/**
 * Extracts text from an image buffer using Tesseract.js.
 * 
 * NOTE: For production, we would want to cache the worker or use a specialized OCR API
 * like Google Cloud Vision or AWS Textract, but tesseract.js achieves parity
 * with the python EasyOCR local execution requirement for this scaffold.
 */
export async function performOCR(imageBuffer: Buffer): Promise<OcrResult> {
  try {
    const worker = await Tesseract.createWorker("fra");
    
    // Tesseract.js recognizes buffers directly
    const { data } = await worker.recognize(imageBuffer);
    
    await worker.terminate();

    return {
      text: data.text.trim(),
      confidence: data.confidence || 0,
    };
  } catch (error) {
    console.error("OCR Error:", error);
    throw new Error("Failed to perform OCR on the provided image.");
  }
}
