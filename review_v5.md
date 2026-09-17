## Current status

Antigravity made useful changes, but the project is **still not ready** because Docker Desktop crashed again while Playwright was running. As a result, the tests could not prove the real Next.js + PostgreSQL + pgvector + LangGraph checkpoint workflow.

Do **not** ask Antigravity to regenerate the final ZIP yet.

There are also two important concerns in its implementation plan:

1. It used:

```sql
TRUNCATE TABLE fleet_catalog, customer_profiles, booking_logs, seasonal_pricing_matrix, rental_policies_vectors RESTART IDENTITY CASCADE;
```

This is acceptable only for a **local development reset**, not as the final idempotent production seed strategy. Your final `db:seed` must use safe upsert/conflict logic and must not truncate operational tables on every normal seed run.

2. It added:

```env
E2E_TEST_MODE=true
```

to the local `.env`. That is acceptable temporarily for testing, but it must not be enabled by default in the final Docker/production environment, final `.env.example`, or submission configuration. It must be documented as test-only and controlled only by server environment, never by frontend/API input.

## What you should do now

1. Start Docker Desktop manually.
2. Wait until Docker Desktop shows the engine as running.
3. Open PowerShell in the project folder and verify:

```powershell
docker version
docker info
docker compose ps
```

You need to see:

- Docker **Client and Server** information.
- Database container running.
- Application container running.

If Docker keeps crashing, restart Windows before asking Antigravity to continue.

4. After Docker is stable, send Antigravity the prompt below.

## Prompt for Antigravity

```text
Docker Desktop has been restarted manually. Resume the Kiraa V6 implementation and verification from the current state.

Do not regenerate the final submission ZIP yet.

First verify Docker is actually stable:

```bash
docker version
docker info
docker compose ps
docker compose logs --tail=200
```

Do not continue unless Docker Server is available and both services are healthy.

==================================================
PHASE 1 — VERIFY DATABASE STATE AFTER RESTART
==================================================

Confirm the PostgreSQL container, database, pgvector extension, and application use the same configured database.

Run:

```bash
docker compose exec db psql -U kiraa -d kiraa -c "SELECT current_database(), current_user;"
docker compose exec db psql -U kiraa -d kiraa -c "SELECT extname FROM pg_extension WHERE extname = 'vector';"
```

Then verify row counts:

```bash
docker compose exec db psql -U kiraa -d kiraa -c "
SELECT 'fleet_catalog' AS table_name, COUNT(*) AS row_count FROM fleet_catalog
UNION ALL
SELECT 'customer_profiles', COUNT(*) FROM customer_profiles
UNION ALL
SELECT 'booking_logs', COUNT(*) FROM booking_logs
UNION ALL
SELECT 'seasonal_pricing_matrix', COUNT(*) FROM seasonal_pricing_matrix
UNION ALL
SELECT 'rental_policies_vectors', COUNT(*) FROM rental_policies_vectors
UNION ALL
SELECT 'checkpoints', COUNT(*) FROM checkpoints
UNION ALL
SELECT 'checkpoint_blobs', COUNT(*) FROM checkpoint_blobs
UNION ALL
SELECT 'checkpoint_writes', COUNT(*) FROM checkpoint_writes;
"
```

Report exact results.

==================================================
PHASE 2 — VERIFY SAFE SEED BEHAVIOR
==================================================

Inspect `db/seed.ts`.

Important: the previous manual command used `TRUNCATE ... CASCADE`. That command is permitted only as a one-time local development reset during troubleshooting. It must not be part of the normal production seed workflow.

Verify and repair the normal `npm run db:seed` behavior so that:

1. It does not truncate, delete all rows, or wipe operational data.
2. It uses safe unique keys and upsert/conflict behavior.
3. It imports all expected CSV data:
   - fleet_catalog
   - customer_profiles
   - booking_logs
   - seasonal_pricing_matrix
4. It loads only `rental_policies.md` into the RAG table.
5. It stores real non-zero embeddings with one consistent embedding model.
6. It is idempotent.

Run:

```bash
npm run db:seed
```

Record all table counts.

Run it again:

```bash
npm run db:seed
```

Record all table counts again.

The second run must not create duplicates and must not erase unrelated operational data.

Report:

```text
SEED_NO_TRUNCATE = PASS | FAIL
SEED_IDEMPOTENCY = PASS | FAIL
FLEET_COUNT = ...
CUSTOMER_COUNT = ...
BOOKING_COUNT = ...
SEASONAL_PRICING_COUNT = ...
RAG_VECTOR_COUNT = ...
```

==================================================
PHASE 3 — VERIFY E2E TEST MODE IS SAFE
==================================================

Inspect all files for `E2E_TEST_MODE`.

Requirements:

1. `E2E_TEST_MODE=true` may be used only in Playwright/test execution.
2. It must never be committed as a real value in `.env.example`.
3. It must not be permanently enabled in production Docker Compose configuration.
4. It must not be accepted from the browser, FormData, query string, or API request body.
5. It may provide deterministic internal intent routing only.
6. It must not mock or bypass:
   - PostgreSQL;
   - pgvector RAG;
   - Tesseract OCR;
   - PDF extraction;
   - deterministic TypeScript engine;
   - PDF generation;
   - PostgresSaver checkpointing.
7. README must explicitly say it is test-only.

Report:

```text
E2E_TEST_MODE_SERVER_ONLY = PASS | FAIL
E2E_TEST_MODE_NOT_PUBLIC_API = PASS | FAIL
E2E_TEST_MODE_NOT_DEFAULT_PRODUCTION = PASS | FAIL
```

==================================================
PHASE 4 — RUN AND FIX PLAYWRIGHT AGAINST REAL SERVICES
==================================================

Do not use mocked browser routes, fake API responses, static OCR text, fake PDF bytes, in-memory RAG, or test-only fake database data.

Before running the full suite, test the API directly with a normal request and confirm a real response:

```bash
curl -i http://localhost:3000/api/health
```

Then run a real API chat test using the actual application configuration.

Run Playwright with Docker services running:

```bash
npx playwright test --workers=1
```

If a test fails:

1. Run that individual test.
2. Inspect the Playwright trace, screenshot, browser console, API response, Next.js logs, and Docker logs.
3. Fix the root cause in the application or test only if the test expectation is genuinely wrong.
4. Do not weaken assertions to hide missing UI/API functionality.
5. Do not increase timeouts unless the application is proven to process correctly but needs a justified longer timeout.

The final browser suite must pass all required real scenarios:

1. Home page loads.
2. Normal chat request receives a real API response.
3. Real JPG identity/licence upload runs actual Tesseract OCR.
4. Real text PDF uses native PDF extraction.
5. Real scanned PDF runs OCR fallback.
6. Policy question shows pgvector RAG passages and citations.
7. Young driver + Premium shows:
   - `needsHumanReview = true`
   - escalation reason
   - deposit increased by 50%
   - `PENDING_REVIEW`
   - no false confirmation.
8. Discount request over 15% displays the actual effective cap of 15%.
9. Valid reservation creates and downloads a non-empty PDF with `%PDF-` signature.
10. Public `intentOverride` injection is rejected or ignored.

Report exact Playwright pass/fail counts.

==================================================
PHASE 5 — RE-VERIFY CORE COMMANDS
==================================================

After Playwright passes, run:

```bash
npm run lint
npm run typecheck
npm run build
npx vitest run
npx playwright test --workers=1
```

All commands must exit with code 0.

==================================================
PHASE 6 — FINAL RUNTIME REPORT
==================================================

Create a completely new report:

```text
FINAL_RUNTIME_VERIFICATION_REPORT.md
```

Do not reuse stale report text.

The report must include:

1. Docker version and Docker Compose status.
2. Container health status.
3. PostgreSQL database name and user.
4. pgvector extension proof.
5. Migration proof and migration filenames.
6. First and second seed counts for every table.
7. Explicit proof that normal seed does not truncate operational tables.
8. Embedding model, dimension, norm, and non-zero verification.
9. pgvector RAG retrieval proof.
10. PostgresSaver persistence proof.
11. `/api/health` response proving `SELECT 1`.
12. E2E_TEST_MODE safety verification.
13. Real OCR and PDF extraction/fallback proof.
14. All 7 LangGraph node traces.
15. Public `intentOverride` injection protection proof.
16. PDF generation and download proof.
17. Lint, typecheck, build, Vitest, and Playwright exit codes.
18. Security scan status.

Use exactly one final status:

```text
READY FOR SUBMISSION
READY WITH BLOCKERS
NOT READY
```

Do not use READY FOR SUBMISSION unless Docker is stable, all services are healthy, all runtime tests pass, all Playwright tests pass, the normal seed is non-destructive and idempotent, and no secrets are in the project or final ZIP.

==================================================
PHASE 7 — FINAL ZIP ONLY AFTER PASS
==================================================

Only if the final report says:

```text
READY FOR SUBMISSION
```

then generate the final ZIP.

The ZIP must include:

- source code;
- package.json and lockfile;
- Dockerfile;
- docker-compose.yml;
- migrations;
- db schema and seed scripts;
- tests;
- Playwright config;
- sample files;
- CSV datasets;
- README;
- `.env.example`.

The ZIP must exclude:

- `.env`;
- any real API key;
- database passwords;
- node_modules;
- .next;
- Docker volumes;
- logs;
- temporary files;
- Playwright screenshots/traces if they contain sensitive data.

Run and report:

```text
ZIP_SECRET_SCAN = PASS
ZIP_ENV_SCAN = PASS
ZIP_NODE_MODULES_SCAN = PASS
ZIP_NEXT_SCAN = PASS
```

Do not call the ZIP final until every scan passes.
```

## Expected result

After Docker is stable, Antigravity should first prove the database is correct, then run the real Playwright suite again. If all 10 browser tests pass and the normal seed does not wipe data, you can then request the final ZIP.

If Docker crashes again, do not keep changing the code. Fix Docker Desktop or restart Windows first.