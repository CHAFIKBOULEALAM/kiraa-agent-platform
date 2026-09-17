/**
 * §4.2 — Vehicle availability check.
 * Pure deterministic TypeScript — zero LLM involvement.
 * Exact parity with notebook's check_vehicle_availability().
 */

import { db } from "@/db";
import { bookingLogs, fleetCatalog } from "@/db/schema";
import { eq, and, lt, gt } from "drizzle-orm";

export interface AvailabilityParams {
  vehicleId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface AvailabilityResult {
  available: boolean;
  vehicleId: string;
  requestedStart: string;
  requestedEnd: string;
  conflictingBookings: number;
  substitutes: Array<{
    vehicleId: string;
    make: string;
    model: string;
    baseDailyRate: number;
  }>;
}

export async function checkVehicleAvailability(
  params: AvailabilityParams
): Promise<AvailabilityResult> {
  const { vehicleId, startDate, endDate } = params;

  // Find overlapping bookings for this vehicle
  const overlaps = await db
    .select()
    .from(bookingLogs)
    .where(
      and(
        eq(bookingLogs.vehicleId, vehicleId),
        lt(bookingLogs.startDate, endDate),
        gt(bookingLogs.endDate, startDate)
      )
    );

  const available = overlaps.length === 0;
  const substitutes: AvailabilityResult["substitutes"] = [];

  if (!available) {
    // Find same-category substitutes
    const vehicle = await db
      .select()
      .from(fleetCatalog)
      .where(eq(fleetCatalog.vehicleId, vehicleId))
      .limit(1);

    if (vehicle.length > 0) {
      const category = vehicle[0].category;
      const sameCat = await db
        .select()
        .from(fleetCatalog)
        .where(eq(fleetCatalog.category, category))
        .limit(5);

      for (const sub of sameCat) {
        if (sub.vehicleId === vehicleId) continue;

        const subOverlaps = await db
          .select()
          .from(bookingLogs)
          .where(
            and(
              eq(bookingLogs.vehicleId, sub.vehicleId),
              lt(bookingLogs.startDate, endDate),
              gt(bookingLogs.endDate, startDate)
            )
          );

        if (subOverlaps.length === 0) {
          substitutes.push({
            vehicleId: sub.vehicleId,
            make: sub.make,
            model: sub.model,
            baseDailyRate: sub.baseDailyRate,
          });
          if (substitutes.length >= 3) break;
        }
      }
    }
  }

  return {
    available,
    vehicleId,
    requestedStart: startDate,
    requestedEnd: endDate,
    conflictingBookings: overlaps.length,
    substitutes,
  };
}
