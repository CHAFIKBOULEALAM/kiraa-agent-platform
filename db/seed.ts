import { db } from "./index";
import {
  fleetCatalog,
  customerProfiles,
  bookingLogs,
  seasonalPricingMatrix,
  rentalPoliciesVectors,
} from "./schema";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { pipeline } from "@xenova/transformers";
import { sql } from "drizzle-orm";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

const DATA_DIR = path.join(process.cwd(), "data");

const EMBEDDING_MODEL = "Xenova/all-MiniLM-L6-v2";
const VECTOR_DIMENSION = 384;

let embeddingPipeline: Awaited<ReturnType<typeof pipeline>> | null = null;

/**
 * Generate a real normalized embedding using Xenova/all-MiniLM-L6-v2.
 * Dimension: 384. Normalized via mean pooling.
 */
async function generateEmbedding(text: string): Promise<number[]> {
  if (!embeddingPipeline) {
    console.log("📦 Loading embedding model Xenova/all-MiniLM-L6-v2...");
    embeddingPipeline = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("✅ Embedding model loaded.");
  }
  const output = await (embeddingPipeline as any)(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

let postgresSaver: any;

async function seed() {
  console.log("🌱 Starting idempotent database seed...");

  // Setup PostgresSaver Checkpointing Tables for LangGraph
  if (process.env.DATABASE_URL) {
    console.log("⚙️  Initializing PostgresSaver checkpoint tables...");
    postgresSaver = PostgresSaver.fromConnString(process.env.DATABASE_URL);
    await postgresSaver.setup();
    console.log("✅ PostgresSaver tables initialized.");
  } else {
    console.warn("⚠️  DATABASE_URL missing, skipping PostgresSaver setup.");
  }

  // Enable pgvector extension
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector`);
  console.log("✅ pgvector extension ensured.");

  // Enable pg_trgm extension for fuzzy matching
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
  console.log("✅ pg_trgm extension ensured.");

  // 1. Seed Fleet Catalog (idempotent — skip on conflict)
  const fleetRaw = fs.readFileSync(path.join(DATA_DIR, "fleet_catalog.csv"), "utf-8");
  const fleetRecords = parse(fleetRaw, { columns: true, skip_empty_lines: true });
  console.log(`🚗 Upserting ${fleetRecords.length} vehicles...`);
  for (const r of fleetRecords as any[]) {
    await db.insert(fleetCatalog).values({
      vehicleId: r.vehicle_id,
      make: r.make,
      model: r.model,
      year: parseInt(r.year, 10),
      category: r.category,
      transmission: r.transmission,
      fuelType: r.fuel_type,
      baseDailyRate: parseFloat(r.base_daily_rate),
      vehiclesAvailable: parseInt(r.vehicles_available, 10),
      location: r.location,
    }).onConflictDoNothing();
  }
  console.log(`✅ Fleet catalog seeded.`);

  // 2. Seed Customer Profiles (idempotent)
  const customersRaw = fs.readFileSync(path.join(DATA_DIR, "customer_profiles.csv"), "utf-8");
  const customerRecords = parse(customersRaw, { columns: true, skip_empty_lines: true });
  console.log(`👤 Upserting ${customerRecords.length} customers...`);
  for (const r of customerRecords as any[]) {
    await db.insert(customerProfiles).values({
      customerId: r.customer_id,
      name: r.full_name,
      age: calculateAge(r.birth_date, "2026-07-15"),
      dob: r.birth_date,
      licenseNumber: r.license_number,
      licenseIssueDate: r.license_issue_date,
      licenseExpiryDate: r.license_exp_date,
      riskCategory: r.risk_category,
    }).onConflictDoNothing();
  }
  console.log(`✅ Customer profiles seeded.`);

  // 3. Seed Booking Logs (idempotent)
  const bookingsRaw = fs.readFileSync(path.join(DATA_DIR, "booking_logs.csv"), "utf-8");
  const bookingRecords = parse(bookingsRaw, { columns: true, skip_empty_lines: true });
  console.log(`📅 Upserting ${bookingRecords.length} bookings...`);
  for (const r of bookingRecords as any[]) {
    await db.insert(bookingLogs).values({
      bookingId: r.booking_id,
      customerId: r.customer_id,
      vehicleId: r.vehicle_id,
      startDate: r.start_date,
      endDate: r.end_date,
      status: "confirmed",
      totalPrice: r.total_price ? parseFloat(r.total_price) : null,
    }).onConflictDoNothing();
  }
  console.log(`✅ Booking logs seeded.`);

  // 4. Seed Seasonal Pricing Matrix (idempotent — clear + re-insert since no unique key)
  const pricingRaw = fs.readFileSync(path.join(DATA_DIR, "seasonal_pricing_matrix.csv"), "utf-8");
  const pricingRecords = parse(pricingRaw, { columns: true, skip_empty_lines: true });
  // Check if already seeded
  const existingPricing: any = await db.execute(sql`SELECT COUNT(*) FROM seasonal_pricing_matrix`);
  const pricingCount = Number(existingPricing[0]?.count || (existingPricing.rows && existingPricing.rows[0]?.count) || 0);
  if (pricingCount === 0) {
    console.log(`📈 Inserting ${pricingRecords.length} seasonal pricing rules...`);
    await db.insert(seasonalPricingMatrix).values(
      pricingRecords.map((r: any) => ({
        month: parseInt(r.month, 10),
        category: r.category,
        multiplier: parseFloat(r.multiplier),
      }))
    );
    console.log(`✅ Seasonal pricing seeded.`);
  } else {
    console.log(`⏭️  Seasonal pricing already seeded (${pricingCount} rows). Skipping.`);
  }

  // 5. Seed Rental Policies for RAG with REAL embeddings (idempotent — skip if already populated)
  const existingVectors: any = await db.execute(sql`SELECT COUNT(*) FROM rental_policies_vectors`);
  const vectorCount = Number(existingVectors[0]?.count || (existingVectors.rows && existingVectors.rows[0]?.count) || 0);

  if (vectorCount === 0) {
    const policiesRaw = fs.readFileSync(path.join(DATA_DIR, "rental_policies.md"), "utf-8");
    const chunks = policiesRaw
      .split(/\n\s*\n/)
      .map(c => c.trim())
      .filter(c => c.length > 20);

    console.log(`📄 Generating REAL embeddings for ${chunks.length} policy chunks...`);
    console.log("   Model: Xenova/all-MiniLM-L6-v2 | Dimension: 384 | Pooling: mean | Normalized: true");

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await generateEmbedding(chunk);

      // Validate embedding is real (not zero)
      const norm = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0));
      if (norm < 0.1) {
        console.warn(`⚠️  Embedding for chunk ${i} has low norm (${norm.toFixed(4)}) — possible model issue.`);
      }

      await db.insert(rentalPoliciesVectors).values({
        contentChunk: chunk,
        embedding,
        metadata: JSON.stringify({ chunkIndex: i, source: "rental_policies.md", norm: norm.toFixed(6), embeddingModel: EMBEDDING_MODEL, dimension: VECTOR_DIMENSION }),
      });

      if ((i + 1) % 5 === 0 || i === chunks.length - 1) {
        console.log(`   Progress: ${i + 1}/${chunks.length} chunks embedded.`);
      }
    }
    console.log(`✅ RAG vectors seeded with real embeddings.`);
  } else {
    console.log(`⏭️  RAG vectors already seeded (${vectorCount} rows). Skipping.`);
  }

  console.log("✅ Idempotent database seed completed successfully!");
  process.exit(0);
}

function calculateAge(birthDateStr: string, referenceDateStr: string): number {
  const birthDate = new Date(birthDateStr);
  const referenceDate = new Date(referenceDateStr);
  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  if (
    referenceDate.getMonth() < birthDate.getMonth() ||
    (referenceDate.getMonth() === birthDate.getMonth() &&
      referenceDate.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});

