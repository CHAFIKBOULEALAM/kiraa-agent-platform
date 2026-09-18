import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { execSync } from 'child_process';
import { db } from '../../../../db/index';
import { sql } from 'drizzle-orm';
import { resolveVehicleMention } from '../../../../lib/engine/vehicleResolution';
import { createAgent } from '../../../../lib/agent/graph';
import { KiraaState } from '../../../../lib/schemas/state';

export async function GET(request: Request) {
  const key = request.headers.get('X-Internal-Verification-Key');
  if (key !== process.env.INTERNAL_VERIFICATION_KEY) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Check vector extension
    let extRes = await pool.query(`SELECT extname FROM pg_extension WHERE extname = 'vector';`);
    let hasVector = extRes.rows.length > 0;
    
    if (!hasVector) {
      await pool.query('CREATE EXTENSION IF NOT EXISTS vector;');
      extRes = await pool.query(`SELECT extname FROM pg_extension WHERE extname = 'vector';`);
      hasVector = extRes.rows.length > 0;
    }

    const stats: any = {
      postgresConnection: true,
      pgvectorPresent: hasVector,
      vectorExtName: hasVector ? 'vector' : 'absent',
    };
    
    await pool.end();

    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const key = request.headers.get('X-Internal-Verification-Key');
  if (key !== process.env.INTERNAL_VERIFICATION_KEY) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const results: any = {};

  try {
    // 1. Fleet catalog query
    const catalogRes = await db.execute(sql`SELECT DISTINCT make, model FROM fleet_catalog ORDER BY make`);
    results.fleetCatalog = (catalogRes as any).rows || catalogRes;

    // 2. pg_trgm check and installation
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
    const trgmRes = await db.execute(sql`SELECT extname FROM pg_extension WHERE extname = 'pg_trgm'`);
    const rows: any = (trgmRes as any).rows || trgmRes;
    results.pgTrgm = rows.length > 0 ? rows[0].extname : 'absent';

    // 3. resolveVehicleMention() tests
    const terms = ["dassi", "peugeot 208", "golf", "clio", "asdfghjkl"];
    results.resolutions = {};
    for (const term of terms) {
      results.resolutions[term] = await resolveVehicleMention(term);
    }

    // 4. PDF Generation Test
    const agent = createAgent();
    const initialState: KiraaState = {
      requestId: `TEST-PDF-${Math.random().toString(36).substring(7)}`,
      rawInput: "Test PDF generation",
      uploadedFiles: [],
      intent: "make_reservation",
      intentConfidence: 1,
      intentOverride: null,
      params: { driverAge: 36, licenseIssueDate: "2010-01-01", vehicleId: "v1" },
      extractedContent: {},
      ocrConfidence: 0,
      eligibilityResult: { 
        eligible: false, 
        age: 36,
        licenseSeniorityYears: 10,
        licenseExpired: false,
        riskCategory: 'High',
        needsHumanReview: false,
        rejectionReasons: ["Testing PDF generation rejection"] 
      },
      priceResult: null,
      bookingStatus: null,
      ragPassages: [],
      validation: {},
      needsHumanReview: false,
      escalationReasons: [],
      errors: [],
      explanation: "",
      report: null,
      pdfReportBase64: null,
      graphTrace: [],
    };

    const finalState = await agent.invoke(initialState, { configurable: { thread_id: initialState.requestId } });
    
    if (finalState.pdfReportBase64) {
      const buffer = Buffer.from(finalState.pdfReportBase64, 'base64');
      results.pdfGeneration = {
        success: true,
        byteLength: buffer.length,
        firstBytes: buffer.slice(0, 8).toString(), // Should be %PDF-
      };
    } else {
      results.pdfGeneration = {
        success: false,
        error: "pdfReportBase64 is null",
      };
    }

  } catch (error: any) {
    results.overallError = error.message;
    results.stack = error.stack;
  }

  return NextResponse.json(results);
}
