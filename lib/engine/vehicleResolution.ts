import { db } from "../../db";
import { fleetCatalog } from "../../db/schema";
import { sql } from "drizzle-orm";

export interface VehicleMatch {
  vehicleId: string;
  make: string;
  model: string;
  similarity: number;
}

/**
 * Resolves a natural language vehicle mention to a specific vehicle in the catalog
 * using PostgreSQL pg_trgm similarity.
 */
export async function resolveVehicleMention(userText: string): Promise<VehicleMatch | null> {
  // If the user didn't mention anything specific, skip.
  if (!userText || userText.trim() === "") return null;

  // We use pg_trgm's similarity function against a concatenation of make and model.
  const query = sql`
    SELECT vehicle_id, make, model, similarity(make || ' ' || model, ${userText}) as sim
    FROM ${fleetCatalog}
    ORDER BY sim DESC
    LIMIT 1;
  `;

  const results: any = await db.execute(query);
  if (!results || results.length === 0) return null;

  const bestMatch = results[0];
  
  // Convert similarity to a number (Postgres driver might return string or number depending on config)
  const simScore = typeof bestMatch.sim === "string" ? parseFloat(bestMatch.sim) : bestMatch.sim;

  // We define a threshold for fuzzy matching. 0.35 is generally good for trigrams.
  if (simScore >= 0.3) {
    return {
      vehicleId: bestMatch.vehicle_id,
      make: bestMatch.make,
      model: bestMatch.model,
      similarity: simScore,
    };
  }

  return null;
}
