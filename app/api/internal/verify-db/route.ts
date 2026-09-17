import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { execSync } from 'child_process';

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

  const results: any = {
    migrations: null,
    seed: null,
    tableCounts: {},
    vectorDims: null
  };

  try {
    // Run Migrations
    results.migrations = execSync('npm run db:migrate', { encoding: 'utf-8', stdio: 'pipe' });
  } catch (err: any) {
    results.migrationsError = err.message + '\n' + err.stdout + '\n' + err.stderr;
  }

  try {
    // Run Seed
    results.seed = execSync('npm run db:seed', { encoding: 'utf-8', stdio: 'pipe' });
  } catch (err: any) {
    results.seedError = err.message + '\n' + err.stdout + '\n' + err.stderr;
  }

  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const tables = [
      'fleet_catalog',
      'customer_profiles',
      'booking_logs',
      'seasonal_pricing_matrix',
      'rental_policies_vectors',
      'checkpoints'
    ];

    for (const t of tables) {
      try {
        const res = await pool.query(`SELECT COUNT(*) as c FROM ${t};`);
        results.tableCounts[t] = res.rows[0].c;
      } catch (e: any) {
        results.tableCounts[t] = 'Error: ' + e.message;
      }
    }

    try {
      const vRes = await pool.query(`SELECT vector_dims(embedding) as dim FROM rental_policies_vectors LIMIT 1;`);
      results.vectorDims = vRes.rows.length > 0 ? vRes.rows[0].dim : 'No rows';
    } catch (e: any) {
      results.vectorDims = 'Error: ' + e.message;
    }
    
    await pool.end();
  } catch (error: any) {
    results.dbError = error.message;
  }

  return NextResponse.json(results);
}
