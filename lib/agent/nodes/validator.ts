import { KiraaState } from "@/lib/schemas/state";
import { verifyDriverEligibility } from "@/lib/engine/eligibility";
import { checkVehicleAvailability } from "@/lib/engine/availability";

export async function validatorNode(state: KiraaState): Promise<Partial<KiraaState>> {
  console.log("-> [Node] Validator");

  let eligibilityResult = state.eligibilityResult;
  let needsHumanReview = state.needsHumanReview;
  let escalationReasons = [...state.escalationReasons];
  
  // Only validate if intent matches and we have the params
  if (state.intent === "validate_eligibility" || state.intent === "make_reservation") {
    if (state.params.birthDate && state.params.licenseIssueDate && state.params.licenseExpiryDate) {
      const res = verifyDriverEligibility({
        birthDate: state.params.birthDate,
        licenseIssueDate: state.params.licenseIssueDate,
        licenseExpiryDate: state.params.licenseExpiryDate,
        vehicleCategory: state.params.vehicleCategory,
      });

      eligibilityResult = res;
      if (res.needsHumanReview) {
        needsHumanReview = true;
        escalationReasons.push("Driver risk category combined with Premium vehicle requires human review.");
      }
    } else {
      escalationReasons.push("Missing driver details for eligibility check.");
    }
  }

  // Example for availability check
  if (state.intent === "check_availability" || state.intent === "make_reservation") {
    if (state.params.vehicleId && state.params.startDate && state.params.endDate) {
      const avail = await checkVehicleAvailability({
        vehicleId: state.params.vehicleId,
        startDate: state.params.startDate,
        endDate: state.params.endDate,
      });
      // Store in validation object to pass to explainer
      return {
        eligibilityResult,
        needsHumanReview,
        escalationReasons,
        validation: { ...state.validation, availability: avail },
        graphTrace: [...state.graphTrace, "validator"],
      };
    }
  }

  return {
    eligibilityResult,
    needsHumanReview,
    escalationReasons,
    graphTrace: [...state.graphTrace, "validator"],
  };
}
