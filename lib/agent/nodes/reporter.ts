import { KiraaState } from "@/lib/schemas/state";
import PDFDocument from "pdfkit";

export async function reporterNode(state: KiraaState): Promise<Partial<KiraaState>> {
  console.log("-> [Node] Reporter");

  // Generate a standardized Markdown report for the final output
  let report = `# Rapport d'Analyse Kiraa\n\n`;
  report += `**ID Requête:** ${state.requestId}\n`;
  report += `**Intention détectée:** ${state.intent} (Confiance: ${(state.intentConfidence * 100).toFixed(0)}%)\n\n`;

  if (state.eligibilityResult) {
    report += `## Éligibilité\n`;
    report += `- Statut: ${state.eligibilityResult.eligible ? "✅ Éligible" : "❌ Rejeté"}\n`;
    report += `- Âge: ${state.eligibilityResult.age} ans\n`;
    report += `- Ancienneté permis: ${state.eligibilityResult.licenseSeniorityYears} ans\n`;
    if (state.eligibilityResult.rejectionReasons.length > 0) {
      report += `- Raisons: ${state.eligibilityResult.rejectionReasons.join(", ")}\n`;
    }
    report += `\n`;
  }

  if (state.priceResult) {
    report += `## Détails Financiers\n`;
    report += `- Véhicule: ${state.priceResult.make || "Véhicule"} ${state.priceResult.model || ""}\n`;
    report += `- Durée: ${state.priceResult.days} jours\n`;
    report += `- Prix de base: ${state.priceResult.baseDailyRate} MAD/jour\n`;
    report += `- Sous-total (avec assurance & saisonnalité): ${state.priceResult.subtotal} MAD\n`;
    report += `- Remise (${state.priceResult.discountCode || "Aucune"}): -${state.priceResult.discountAmount} MAD\n`;
    report += `- Caution: ${state.priceResult.deposit} MAD\n`;
    report += `**Total à payer: ${state.priceResult.totalPrice} MAD**\n\n`;
  }

  let bookingStatus: "CONFIRMED" | "PENDING_REVIEW" | "MISSING_DETAILS" | null = null;
  if (state.intent === "human_escalation" || state.needsHumanReview) {
    report += `## ⚠️ Escalade Humaine Requise\n`;
    report += state.escalationReasons.map(r => `- ${r}`).join("\n") + "\n\n";
    bookingStatus = "PENDING_REVIEW";
  }

  // Generate PDF only for eligible complete reservations
  let pdfReportBase64 = null;
  if (state.intent === "make_reservation" && state.eligibilityResult?.eligible && state.priceResult) {
    try {
      pdfReportBase64 = await new Promise<string>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData.toString('base64'));
      });
      doc.on('error', reject);

      doc.fontSize(20).text("Rapport d'Analyse Kiraa", { align: 'center' });
      doc.moveDown();
      
      const safeRequestId = state.requestId.length > 30 ? state.requestId.substring(0, 30) + "..." : state.requestId;
      doc.fontSize(12).text(`ID Requête: ${safeRequestId}`);
      
      const safeIntent = state.intent && state.intent.length > 50 ? state.intent.substring(0, 50) + "..." : (state.intent || "Inconnu");
      doc.text(`Intention détectée: ${safeIntent}`);
      doc.moveDown();

      if (state.eligibilityResult) {
        doc.fontSize(16).text("Eligibilite");
        doc.fontSize(12).text(`Statut: ${state.eligibilityResult.eligible ? "Eligible" : "Rejete"}`);
        doc.text(`Age: ${state.eligibilityResult.age} ans`);
        
        if (state.eligibilityResult.rejectionReasons && state.eligibilityResult.rejectionReasons.length > 0) {
           doc.text("Raisons du rejet:");
           state.eligibilityResult.rejectionReasons.forEach(r => {
             doc.fontSize(12).text(`- ${r}`, { width: 450, align: 'left' });
           });
        }
        doc.moveDown();
      }

      if (state.priceResult) {
        doc.fontSize(16).text("Details Financiers");
        doc.fontSize(12).text(`Duree: ${state.priceResult.days} jours`);
        doc.text(`Sous-total: ${state.priceResult.subtotal} MAD`);
        doc.text(`Caution: ${state.priceResult.deposit} MAD`);
        doc.text(`Total a payer: ${state.priceResult.totalPrice} MAD`);
        doc.moveDown();
      }

      if (state.needsHumanReview) {
        doc.fontSize(16).text("Escalade Humaine Requise");
        state.escalationReasons.forEach(r => {
          doc.fontSize(12).text(`- ${r}`, { width: 450, align: 'left' });
        });
      }

      doc.end();
      });
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    }
  }

  return {
    report,
    pdfReportBase64,
    bookingStatus,
    graphTrace: [...state.graphTrace, "reporter"],
  };
}
