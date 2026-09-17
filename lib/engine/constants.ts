/**
 * Business constants — exact parity with the Python notebook Module 2.
 * These values are the single source of truth for all deterministic calculations.
 */

/** Deposit amounts by vehicle category (MAD) */
export const DEPOSIT_BY_CATEGORY: Record<string, number> = {
  Economy: 2000,
  Compact: 3000,
  SUV: 5000,
  Premium: 15000,
  Utility: 7000,
};

/** Insurance options with daily rate and flat fee (MAD) */
export const INSURANCE_OPTIONS: Record<string, { label: string; dailyRate: number; flatFee: number }> = {
  basic: { label: "Assurance de base (incluse)", dailyRate: 0, flatFee: 0 },
  all_risk: { label: "Tous risques", dailyRate: 80, flatFee: 0 },
  franchise_buyback: { label: "Rachat de franchise", dailyRate: 0, flatFee: 500 },
};

/** Discount codes with nominal rates */
export const DISCOUNT_CODES: Record<string, { rate: number; label: string; validUntil: string }> = {
  LOYAL10: { rate: 0.10, label: "Fidélité 10%", validUntil: "2026-12-31" },
  WELCOME5: { rate: 0.05, label: "Bienvenue 5%", validUntil: "2026-12-31" },
  SUMMER20: { rate: 0.20, label: "Été 20% (plafonné à 15%)", validUntil: "2026-08-31" },
  FLASH25: { rate: 0.25, label: "Flash 25% (plafonné à 15%)", validUntil: "2026-07-31" },
};

/** Maximum discount rate — hard cap at 15% regardless of code nominal rate */
export const MAX_DISCOUNT_RATE = 0.15;

/** Extra mileage rate (MAD per km) */
export const EXTRA_KM_RATE = 2.50;

/** Daily mileage allowance (km per day) */
export const DAILY_KM_ALLOWANCE = 300;

/** Minimum driver age */
export const MIN_DRIVER_AGE = 21;

/** Minimum license seniority (years) */
export const MIN_LICENSE_SENIORITY = 2.0;

/** Young driver age threshold */
export const YOUNG_DRIVER_AGE = 25;

/** Deposit increase factor for young drivers */
export const YOUNG_DRIVER_DEPOSIT_FACTOR = 1.5;

/** Human review threshold for deposit (MAD) */
export const DEPOSIT_HITL_THRESHOLD = 20000;
