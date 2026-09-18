/**
 * §4.1 — Driver eligibility verification.
 * Pure deterministic TypeScript — zero LLM involvement.
 * Exact parity with notebook's verify_driver_eligibility().
 */

import {
  MIN_DRIVER_AGE,
  MIN_LICENSE_SENIORITY,
  YOUNG_DRIVER_AGE,
} from "./constants";

export interface EligibilityParams {
  birthDate: string;       // YYYY-MM-DD
  licenseIssueDate: string; // YYYY-MM-DD
  licenseExpiryDate: string; // YYYY-MM-DD
  referenceDate?: string;   // YYYY-MM-DD (defaults to today)
  vehicleCategory?: string;
}

export interface EligibilityResult {
  eligible: boolean;
  age: number;
  licenseSeniorityYears: number;
  licenseExpired: boolean;
  riskCategory: string;
  rejectionReasons: string[];
  needsHumanReview: boolean;
  vehicleCategory: string | null;
}

/** Calculate age in complete years at reference date */
function calculateAge(birthDate: Date, referenceDate: Date): number {
  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  const monthDay = (d: Date) => d.getMonth() * 100 + d.getDate();
  if (monthDay(referenceDate) < monthDay(birthDate)) {
    age -= 1;
  }
  return age;
}

/** Calculate fractional years between two dates */
function calculateYearsBetween(start: Date, end: Date): number {
  const diffMs = end.getTime() - start.getTime();
  const days = diffMs / (1000 * 60 * 60 * 24);
  return Math.round((days / 365.25) * 10) / 10;
}

/**
 * Verify driver eligibility.
 *
 * Rules (§4.1):
 * - eligible = (age >= 21) AND (license seniority >= 2 years)
 * - Expired license → blocking rejection regardless of age
 * - age < 25 → risk_category = "jeune_conducteur" → deposit +50%
 * - Human review only if young driver + Premium vehicle (CORRECTIF C3)
 */
export function verifyDriverEligibility(params: EligibilityParams): EligibilityResult {
  const birthDate = new Date(params.birthDate);
  const licenseIssueDate = new Date(params.licenseIssueDate);
  const referenceDate = params.referenceDate
    ? new Date(params.referenceDate)
    : new Date();

  const age = calculateAge(birthDate, referenceDate);
  const seniority = calculateYearsBetween(licenseIssueDate, referenceDate);

  let expired = false;
  let expiryDateStr = "";
  if (params.licenseExpiryDate) {
    const licenseExpiryDate = new Date(params.licenseExpiryDate);
    if (!isNaN(licenseExpiryDate.getTime()) && licenseExpiryDate < referenceDate) {
      expired = true;
      expiryDateStr = licenseExpiryDate.toISOString().split("T")[0];
    }
  }

  let eligible = true;
  const reasons: string[] = [];

  if (age < MIN_DRIVER_AGE) {
    eligible = false;
    reasons.push(`Âge insuffisant : ${age} ans (minimum requis : ${MIN_DRIVER_AGE} ans)`);
  }

  if (seniority < MIN_LICENSE_SENIORITY) {
    eligible = false;
    reasons.push(
      `Ancienneté du permis insuffisante : ${seniority} ans (minimum requis : ${MIN_LICENSE_SENIORITY} ans)`
    );
  }

  if (expired) {
    eligible = false;
    reasons.push(`Permis expiré depuis le ${expiryDateStr}`);
  }

  let riskCategory: string;
  if (eligible && age < YOUNG_DRIVER_AGE) {
    riskCategory = "jeune_conducteur";
  } else if (eligible) {
    riskCategory = "standard";
  } else {
    riskCategory = "ineligible";
  }

  // CORRECTIF C3: escalation only if young driver + Premium vehicle
  const needsHumanReview =
    eligible &&
    riskCategory === "jeune_conducteur" &&
    params.vehicleCategory === "Premium";

  return {
    eligible,
    age,
    licenseSeniorityYears: seniority,
    licenseExpired: expired,
    riskCategory,
    rejectionReasons: reasons,
    needsHumanReview,
    vehicleCategory: params.vehicleCategory ?? null,
  };
}
