import { describe, it, expect, vi } from "vitest";
import { verifyDriverEligibility } from "@/lib/engine/eligibility";
import { calculateTotalPrice } from "@/lib/engine/pricing";
import { checkVehicleAvailability } from "@/lib/engine/availability";
import { calculateMileagePenalty } from "@/lib/engine/mileage";
import { db } from "@/db";

// Mock Drizzle DB calls for checkVehicleAvailability
vi.mock("@/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => []), // Return empty array by default (available)
        limit: vi.fn(() => []),
      })),
    })),
  },
}));

describe("Module 2: Deterministic Engine Tests", () => {
  const referenceDate = "2026-07-15";

  describe("§4.1 Driver Eligibility", () => {
    it("T1: Conducteur mineur -> REJETÉ", () => {
      const res = verifyDriverEligibility({
        birthDate: "2007-03-10",
        licenseIssueDate: "2025-06-15",
        licenseExpiryDate: "2035-06-15",
        referenceDate,
      });
      expect(res.eligible).toBe(false);
      expect(res.rejectionReasons[0]).toMatch(/Âge insuffisant/);
    });

    it("T2: Permis trop récent -> REJETÉ", () => {
      const res = verifyDriverEligibility({
        birthDate: "1990-01-01",
        licenseIssueDate: "2025-01-01",
        licenseExpiryDate: "2035-01-01",
        referenceDate,
      });
      expect(res.eligible).toBe(false);
      expect(res.rejectionReasons[0]).toMatch(/Ancienneté du permis insuffisante/);
    });

    it("T3: Permis expiré -> REJETÉ", () => {
      const res = verifyDriverEligibility({
        birthDate: "1990-01-01",
        licenseIssueDate: "2010-01-01",
        licenseExpiryDate: "2025-01-01",
        referenceDate,
      });
      expect(res.eligible).toBe(false);
      expect(res.rejectionReasons[0]).toMatch(/Permis expiré/);
    });

    it("T4: Conducteur standard -> ÉLIGIBLE", () => {
      const res = verifyDriverEligibility({
        birthDate: "1990-01-01",
        licenseIssueDate: "2010-01-01",
        licenseExpiryDate: "2030-01-01",
        referenceDate,
        vehicleCategory: "SUV",
      });
      expect(res.eligible).toBe(true);
      expect(res.riskCategory).toBe("standard");
      expect(res.needsHumanReview).toBe(false);
    });

    it("T5: Jeune conducteur + Premium -> HITL déclenché", () => {
      const res = verifyDriverEligibility({
        birthDate: "2003-01-01", // 23 years old in 2026
        licenseIssueDate: "2022-01-01",
        licenseExpiryDate: "2032-01-01",
        referenceDate,
        vehicleCategory: "Premium",
      });
      expect(res.eligible).toBe(true);
      expect(res.riskCategory).toBe("jeune_conducteur");
      expect(res.needsHumanReview).toBe(true); // HITL
    });
  });

  describe("§4.3 Financial Calculation", () => {
    it("T6: Calcul total basique (sans remise)", () => {
      const res = calculateTotalPrice({
        baseDailyRate: 400,
        category: "Economy",
        days: 5,
        month: 7, // Summer
        seasonalMultiplier: 1.3,
        insuranceOption: "basic", // 0 MAD/day
        discountCode: "",
        riskCategory: "standard",
      });
      // Subtotal = 400 * 5 * 1.3 + 0 = 2600
      // Deposit = 2000
      // Total = 2600 + 2000 = 4600
      expect(res.subtotal).toBe(2600);
      expect(res.deposit).toBe(2000);
      expect(res.totalPrice).toBe(4600);
      expect(res.discountAmount).toBe(0);
    });

    it("T7: Remise nominale > 15% -> PLAFONNÉE", () => {
      const res = calculateTotalPrice({
        baseDailyRate: 400,
        category: "Economy",
        days: 5,
        month: 7,
        seasonalMultiplier: 1.3,
        insuranceOption: "basic",
        discountCode: "FLASH25", // 25% nominal -> capped at 15%
        riskCategory: "standard",
      });
      expect(res.discountCapped).toBe(true);
      // Subtotal = 2600
      // Discount = 2600 * 0.15 = 390
      expect(res.discountAmount).toBe(390);
      expect(res.totalPrice).toBe(2600 + 2000 - 390);
    });

    it("T8: Remise nominale <= 15% -> NON PLAFONNÉE", () => {
      const res = calculateTotalPrice({
        baseDailyRate: 400,
        category: "Economy",
        days: 5,
        month: 7,
        seasonalMultiplier: 1.3,
        insuranceOption: "basic",
        discountCode: "LOYAL10", // 10% nominal
        riskCategory: "standard",
      });
      expect(res.discountCapped).toBe(false);
      // Subtotal = 2600
      // Discount = 2600 * 0.10 = 260
      expect(res.discountAmount).toBe(260);
    });

    it("T9: Jeune conducteur -> Caution +50%", () => {
      const res = calculateTotalPrice({
        baseDailyRate: 400,
        category: "Economy",
        days: 5,
        month: 7,
        seasonalMultiplier: 1.3,
        insuranceOption: "basic",
        discountCode: "",
        riskCategory: "jeune_conducteur",
      });
      // Base deposit for Economy is 2000. +50% = 3000
      expect(res.deposit).toBe(3000);
      expect(res.depositNote).toMatch(/Caution majorée \+50%/);
    });

    it("T10: Total plancher (max(Total, Caution))", () => {
      const res = calculateTotalPrice({
        baseDailyRate: 100,
        category: "Economy",
        days: 1, // 1 day
        month: 10,
        seasonalMultiplier: 1.0,
        insuranceOption: "basic",
        discountCode: "",
        riskCategory: "standard",
      });
      // Subtotal = 100
      // Deposit = 2000
      // Expected total before floor: 100 + 2000 = 2100 -> NO FLOOR APPLIED. 
      // Wait, let's create a case where total < deposit. 
      // Formula: Total = Subtotal + Deposit - Discount
      // Subtotal + Deposit - Discount < Deposit => Subtotal < Discount
      // Discount is max 15% of Subtotal, so Subtotal - 0.15*Subtotal = 0.85*Subtotal. 
      // 0.85 * Subtotal is always > 0 (for positive subtotal). 
      // Thus, Total is always > Deposit unless base price or days is negative.
      // But let's check the function logic.
      expect(res.totalPrice).toBe(2100);
      expect(res.floorApplied).toBe(false);
    });
  });

  describe("§4.4 Mileage Penalty", () => {
    it("T11: Pas de pénalité si sous le forfait", () => {
      const res = calculateMileagePenalty(250, 300);
      expect(res.kmOverage).toBe(0);
      expect(res.penalty).toBe(0);
    });

    it("T12: Pénalité calculée correctement si dépassement", () => {
      const res = calculateMileagePenalty(350, 300);
      expect(res.kmOverage).toBe(50);
      expect(res.penalty).toBe(125); // 50 * 2.50 = 125
    });
  });

  describe("§4.2 Vehicle Availability", () => {
    it("T13: Véhicule disponible (mock DB empty)", async () => {
      const res = await checkVehicleAvailability({
        vehicleId: "VH-123",
        startDate: "2026-07-20",
        endDate: "2026-07-25",
      });
      expect(res.available).toBe(true);
      expect(res.conflictingBookings).toBe(0);
    });
  });
});
