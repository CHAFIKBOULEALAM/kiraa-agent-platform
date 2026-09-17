import { pgTable, varchar, integer, real, text, date, timestamp, serial, boolean, index } from "drizzle-orm/pg-core";
import { customType } from "drizzle-orm/pg-core";

// ─── pgvector custom type ───
const vector = customType<{ data: number[]; driverParam: string; notNull: false; default: false }>({
  dataType() {
    return "vector(384)";
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`;
  },
});

// ─── Fleet Catalog ───
export const fleetCatalog = pgTable("fleet_catalog", {
  vehicleId: varchar("vehicle_id", { length: 20 }).primaryKey(),
  make: varchar("make", { length: 50 }).notNull(),
  model: varchar("model", { length: 50 }).notNull(),
  year: integer("year").notNull(),
  category: varchar("category", { length: 20 }).notNull(),
  transmission: varchar("transmission", { length: 20 }).notNull(),
  fuelType: varchar("fuel_type", { length: 20 }).notNull(),
  baseDailyRate: real("base_daily_rate").notNull(),
  vehiclesAvailable: integer("vehicles_available").notNull(),
  location: varchar("location", { length: 50 }).notNull(),
});

// ─── Customer Profiles ───
export const customerProfiles = pgTable("customer_profiles", {
  customerId: varchar("customer_id", { length: 20 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  age: integer("age").notNull(),
  dob: date("dob").notNull(),
  licenseNumber: varchar("license_number", { length: 30 }).notNull(),
  licenseIssueDate: date("license_issue_date").notNull(),
  licenseExpiryDate: date("license_expiry_date").notNull(),
  riskCategory: varchar("risk_category", { length: 20 }).notNull(),
});

// ─── Booking Logs ───
export const bookingLogs = pgTable("booking_logs", {
  bookingId: varchar("booking_id", { length: 20 }).primaryKey(),
  customerId: varchar("customer_id", { length: 20 }).notNull(),
  vehicleId: varchar("vehicle_id", { length: 20 }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  totalPrice: real("total_price"),
});

// ─── Seasonal Pricing Matrix ───
export const seasonalPricingMatrix = pgTable("seasonal_pricing_matrix", {
  id: serial("id").primaryKey(),
  month: integer("month").notNull(),
  category: varchar("category", { length: 20 }).notNull(),
  multiplier: real("multiplier").notNull(),
});

// ─── Rental Policies Vectors (pgvector RAG) ───
export const rentalPoliciesVectors = pgTable(
  "rental_policies_vectors",
  {
    id: serial("id").primaryKey(),
    contentChunk: text("content_chunk").notNull(),
    embedding: vector("embedding"),
    metadata: text("metadata"),
  },
  (table) => [
    index("embedding_idx").using("ivfflat", table.embedding),
  ]
);
