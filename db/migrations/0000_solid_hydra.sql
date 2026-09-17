CREATE TABLE "booking_logs" (
	"booking_id" varchar(20) PRIMARY KEY NOT NULL,
	"customer_id" varchar(20) NOT NULL,
	"vehicle_id" varchar(20) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" varchar(20) NOT NULL,
	"total_price" real
);
--> statement-breakpoint
CREATE TABLE "customer_profiles" (
	"customer_id" varchar(20) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"age" integer NOT NULL,
	"dob" date NOT NULL,
	"license_number" varchar(30) NOT NULL,
	"license_issue_date" date NOT NULL,
	"license_expiry_date" date NOT NULL,
	"risk_category" varchar(20) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fleet_catalog" (
	"vehicle_id" varchar(20) PRIMARY KEY NOT NULL,
	"make" varchar(50) NOT NULL,
	"model" varchar(50) NOT NULL,
	"year" integer NOT NULL,
	"category" varchar(20) NOT NULL,
	"transmission" varchar(20) NOT NULL,
	"fuel_type" varchar(20) NOT NULL,
	"base_daily_rate" real NOT NULL,
	"vehicles_available" integer NOT NULL,
	"location" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rental_policies_vectors" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_chunk" text NOT NULL,
	"embedding" vector(384),
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "seasonal_pricing_matrix" (
	"id" serial PRIMARY KEY NOT NULL,
	"month" integer NOT NULL,
	"category" varchar(20) NOT NULL,
	"multiplier" real NOT NULL
);
--> statement-breakpoint
CREATE INDEX "embedding_idx" ON "rental_policies_vectors" USING ivfflat ("embedding");