import { KiraaState } from "@/lib/schemas/state";
import { DriverLicenseSchema } from "@/lib/schemas/extraction";
import { ChatGroq } from "@langchain/groq";

const groqModel = new ChatGroq({
  model: process.env.LLM_MODEL || process.env.GROQ_MODEL || "qwen/qwen3.8-27b", // matching notebook's model
  temperature: 0,
});

const extractionModel = groqModel.withStructuredOutput(DriverLicenseSchema, {
  name: "extract_driver_license",
});

export async function extractorNode(state: KiraaState): Promise<Partial<KiraaState>> {
  console.log("-> [Node] Extractor");

  const keys = Object.keys(state.extractedContent);
  if (keys.length === 0) {
    return { graphTrace: [...state.graphTrace, "extractor"] };
  }

  // Find the first document that looks like an ID/License
  // In the scaffold, we just process the first one for simplicity or combine them.
  const allText = keys.map(k => state.extractedContent[k]).join("\n\n");

  try {
    const extractedData = await extractionModel.invoke([
      {
        role: "system",
        content: "You are an expert AI specialized in extracting Moroccan ID and driver license data. Extract the exact fields requested. Return valid JSON only.",
      },
      {
        role: "user",
        content: `Extract the requested information from the following OCR text:\n\n${allText}`,
      }
    ]);

    // Merge into state.params
    return {
      params: {
        ...state.params,
        name: extractedData.name,
        idNumber: extractedData.idNumber,
        birthDate: extractedData.dob,
        licenseNumber: extractedData.licenseNumber,
        licenseIssueDate: extractedData.licenseIssueDate,
        licenseExpiryDate: extractedData.licenseExpiryDate,
      },
      graphTrace: [...state.graphTrace, "extractor"],
    };
  } catch (error) {
    console.error("Extractor LLM Error:", error);
    return {
      errors: [...state.errors, "Failed to extract structured data from document."],
      graphTrace: [...state.graphTrace, "extractor"],
    };
  }
}
