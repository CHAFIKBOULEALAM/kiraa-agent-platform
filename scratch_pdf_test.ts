import { config } from "dotenv";
config();
import { createAgent } from "./lib/agent/graph";
import { KiraaState } from "./lib/schemas/state";
import * as fs from "fs";

async function verifyPDF() {
  try {
    const initialState: KiraaState = {
      requestId: "TEST-PDF-123",
      rawInput: "Je veux louer une voiture, j'ai 36 ans, j'ai le permis depuis 1 an.",
      uploadedFiles: [],
      intent: null,
      intentConfidence: 0,
      intentOverride: "make_reservation",
      params: {
        driverAge: 36,
        licenseIssueDate: "2023-01-01",
        vehicleId: "v123",
        startDate: "2023-12-01",
        endDate: "2023-12-05"
      },
      extractedContent: {},
      ocrConfidence: 0,
      eligibilityResult: null,
      priceResult: null,
      bookingStatus: null,
      ragPassages: [],
      validation: {},
      needsHumanReview: false,
      escalationReasons: [],
      errors: [],
      explanation: "",
      report: null,
      pdfReportBase64: null,
      graphTrace: [],
    };

    const agent = createAgent();
    const finalState = await agent.invoke(initialState, { configurable: { thread_id: "TEST-PDF-123" } });
    
    if (finalState.pdfReportBase64) {
      const buffer = Buffer.from(finalState.pdfReportBase64, "base64");
      fs.writeFileSync("test_report.pdf", buffer);
      console.log("PDF saved to test_report.pdf");
      
      const buf = fs.readFileSync("test_report.pdf");
      console.log('First bytes:', buf.slice(0,8).toString());
      console.log('Size:', buf.length);
    } else {
      console.log("No PDF generated.");
    }
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}

verifyPDF();
