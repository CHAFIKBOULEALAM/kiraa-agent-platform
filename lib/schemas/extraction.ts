import { z } from "zod";

/** Structured extraction schema for driver license / ID documents (Pydantic parity) */
export const DriverLicenseSchema = z.object({
  name: z.string().describe("Full name of the driver"),
  idNumber: z.string().describe("National ID number"),
  dob: z.string().describe("Date of birth (YYYY-MM-DD)"),
  licenseNumber: z.string().describe("Driver license number"),
  licenseIssueDate: z.string().describe("License issue date (YYYY-MM-DD)"),
  licenseExpiryDate: z.string().describe("License expiry date (YYYY-MM-DD)"),
});

export type DriverLicense = z.infer<typeof DriverLicenseSchema>;
