/**
 * §4.4 — Mileage penalty calculation.
 * Pure deterministic TypeScript — zero LLM involvement.
 * Exact parity with notebook's calculate_mileage_penalty().
 *
 * Formula:
 *   overage = max(0, km_driven - km_allowed)
 *   penalty = overage × extra_km_rate
 */

import { EXTRA_KM_RATE } from "./constants";

export interface MileageResult {
  kmDriven: number;
  kmAllowed: number;
  kmOverage: number;
  extraKmRate: number;
  penalty: number;
}

export function calculateMileagePenalty(
  kmDriven: number,
  kmAllowed: number,
  extraKmRate: number = EXTRA_KM_RATE
): MileageResult {
  const overage = Math.max(0, kmDriven - kmAllowed);
  const penalty = Math.round(overage * extraKmRate * 100) / 100;

  return {
    kmDriven,
    kmAllowed,
    kmOverage: overage,
    extraKmRate,
    penalty,
  };
}
