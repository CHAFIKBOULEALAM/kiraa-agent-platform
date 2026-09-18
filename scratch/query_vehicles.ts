import { db } from "../db/index";
import { fleetCatalog } from "../db/schema";
import { asc } from "drizzle-orm";

async function main() {
  try {
    const distinctVehicles = await db
      .selectDistinct({ make: fleetCatalog.make, model: fleetCatalog.model })
      .from(fleetCatalog)
      .orderBy(asc(fleetCatalog.make));
      
    console.log("=== DISTINCT VEHICLES ===");
    for (const v of distinctVehicles) {
      console.log(`- ${v.make} ${v.model}`);
    }
  } catch (e) {
    console.error("DB Error:", e);
  }
}

main().then(() => process.exit(0));
