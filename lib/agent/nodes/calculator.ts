import { KiraaState } from "@/lib/schemas/state";
import { calculateTotalPrice } from "@/lib/engine/pricing";

export async function calculatorNode(state: KiraaState): Promise<Partial<KiraaState>> {
  console.log("-> [Node] Calculator");

  let priceResult = state.priceResult;
  let needsHumanReview = state.needsHumanReview;
  let escalationReasons = [...state.escalationReasons];

  if (state.intent === "calculate_total_cost" || state.intent === "make_reservation") {
    // Requires base params
    if (state.params.baseDailyRate && state.params.days && state.params.category) {
      const res = calculateTotalPrice({
        baseDailyRate: state.params.baseDailyRate,
        category: state.params.category,
        days: state.params.days,
        month: state.params.month || 7, // default summer for scaffold if missing
        seasonalMultiplier: state.params.seasonalMultiplier || 1.0,
        insuranceOption: state.params.insuranceOption || "basic",
        discountCode: state.params.discountCode || "",
        riskCategory: state.eligibilityResult?.riskCategory || "standard",
        vehicleId: state.params.vehicleId,
        make: state.params.make,
        model: state.params.model,
      });

      priceResult = res;

      if (res.needsHumanReview) {
        needsHumanReview = true;
        escalationReasons.push("Deposit exceeds HITL threshold (20000 MAD).");
      }
    }
  }

  return {
    priceResult,
    needsHumanReview,
    escalationReasons,
    graphTrace: [...state.graphTrace, "calculator"],
  };
}
