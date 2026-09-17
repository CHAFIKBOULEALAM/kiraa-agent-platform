/**
 * §4.3 — Financial calculation.
 * Pure deterministic TypeScript — zero LLM involvement.
 * Exact parity with notebook's calculate_total_price().
 *
 * Formula:
 *   Total = (BasePrice × Days × SeasonalMultiplier) + InsuranceCost + Deposit − CappedDiscount
 *   Total = max(Total, Deposit)
 */

import {
  DEPOSIT_BY_CATEGORY,
  INSURANCE_OPTIONS,
  DISCOUNT_CODES,
  MAX_DISCOUNT_RATE,
  YOUNG_DRIVER_DEPOSIT_FACTOR,
  DEPOSIT_HITL_THRESHOLD,
} from "./constants";

export interface PricingParams {
  baseDailyRate: number;
  category: string;
  days: number;
  month: number;
  seasonalMultiplier: number;
  insuranceOption: string;
  discountCode: string;
  riskCategory: string;
  vehicleId?: string;
  make?: string;
  model?: string;
}

export interface PriceResult {
  vehicleId: string;
  make: string;
  model: string;
  category: string;
  baseDailyRate: number;
  days: number;
  month: number;
  seasonalMultiplier: number;
  insuranceOption: string;
  insuranceCost: number;
  deposit: number;
  depositNote: string;
  subtotal: number;
  discountCode: string;
  discountAmount: number;
  discountCapped: boolean;
  discountNote: string;
  floorApplied: boolean;
  totalPrice: number;
  needsHumanReview: boolean;
}

export function calculateTotalPrice(params: PricingParams): PriceResult {
  const {
    baseDailyRate,
    category,
    days,
    month,
    seasonalMultiplier,
    insuranceOption,
    discountCode,
    riskCategory,
    vehicleId = "",
    make = "",
    model = "",
  } = params;

  // Insurance cost
  const ins = INSURANCE_OPTIONS[insuranceOption] ?? INSURANCE_OPTIONS.basic;
  const insuranceCost = ins.dailyRate * days + ins.flatFee;

  // Deposit (§4.3: +50% for jeune_conducteur)
  const baseDeposit = DEPOSIT_BY_CATEGORY[category] ?? 3000;
  let deposit: number;
  let depositNote: string;

  if (riskCategory === "jeune_conducteur") {
    deposit = Math.floor(baseDeposit * YOUNG_DRIVER_DEPOSIT_FACTOR);
    depositNote = `Caution majorée +50% (jeune conducteur) : ${baseDeposit} → ${deposit} MAD`;
  } else {
    deposit = baseDeposit;
    depositNote = `Caution standard : ${deposit} MAD`;
  }

  // Subtotal
  const subtotal = baseDailyRate * days * seasonalMultiplier + insuranceCost;

  // Discount (capped at 15%)
  let discountAmount = 0;
  let discountNote = "Aucune remise appliquée";
  let discountCapped = false;

  if (discountCode && DISCOUNT_CODES[discountCode]) {
    const codeInfo = DISCOUNT_CODES[discountCode];
    const nominal = codeInfo.rate;
    const effective = Math.min(nominal, MAX_DISCOUNT_RATE);
    discountAmount = Math.round(subtotal * effective * 100) / 100;
    discountCapped = nominal > MAX_DISCOUNT_RATE;

    if (discountCapped) {
      discountNote =
        `Code '${discountCode}' : taux nominal ${nominal * 100}% ` +
        `PLAFONNÉ à 15% (règle métier §4.3). ` +
        `Remise effective : ${discountAmount.toFixed(2)} MAD`;
    } else {
      discountNote =
        `Code '${discountCode}' : ${nominal * 100}%. ` +
        `Remise : ${discountAmount.toFixed(2)} MAD`;
    }
  }

  // Total with floor
  let total = subtotal + deposit - discountAmount;
  let floorApplied = false;
  if (total < deposit) {
    total = deposit;
    floorApplied = true;
  }
  total = Math.round(total * 100) / 100;

  return {
    vehicleId,
    make,
    model,
    category,
    baseDailyRate,
    days,
    month,
    seasonalMultiplier,
    insuranceOption,
    insuranceCost: Math.round(insuranceCost * 100) / 100,
    deposit,
    depositNote,
    subtotal: Math.round(subtotal * 100) / 100,
    discountCode,
    discountAmount: Math.round(discountAmount * 100) / 100,
    discountCapped,
    discountNote,
    floorApplied,
    totalPrice: total,
    needsHumanReview: deposit > DEPOSIT_HITL_THRESHOLD,
  };
}
