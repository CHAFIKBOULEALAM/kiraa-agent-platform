## Current status

You have made strong progress: Docker containers are healthy, PostgreSQL and pgvector are running, data is seeded, real non-zero embeddings exist, the health endpoint checks PostgreSQL, and LangGraph checkpoint rows now increase from 7 to 14 for the same `thread_id`.

However, the project is still correctly classified as:

```text
NOT READY
```

because **8 of 10 Playwright browser tests fail**. Do not regenerate or submit the final ZIP yet.

## Important inconsistencies to fix first

Before fixing the UI tests, Antigravity must resolve several contradictions in its reports.

| Item | Phase 7A report | Final report | Required action |
|---|---|---|---|
| Fleet rows | 50 | 32 | Explain and correct the mismatch |
| Customer rows | 20 | 5 | Explain and correct the mismatch |
| Policy vectors | 26 | 11 | Explain and correct the mismatch |
| Embedding model | `Xenova/all-MiniLM-L6-v2` | `Xenova/bge-small-en-v1.5` | Use one configured model consistently |
| PDF generator | `pdfkit` previously | `jsPDF` in final report | Confirm which real production library is used |
| Seed evidence | Phase 7A counts not fully shown before/after second seed | Final report shows different counts | Re-run seed and SQL checks from the same database/container |
| “Fallback triggered” | Claimed in final report | Playwright scan failed | Prove with a real scanned PDF and visible result |
| ZIP scanner | Excludes `.md` from secret scanner | Prompt files/README can contain sensitive instructions or accidental secrets | Never exclude all Markdown files; redact only known safe examples and scan all actual project files |

The biggest issue is the contradictory database counts. This often happens when Antigravity used different database names, host-vs-container URLs, a different Docker volume, or different project folders. Until it proves that the app container, host seed script, and database queries use the **same PostgreSQL database**, you cannot trust the test results.

## What you should do

Give Antigravity the prompt below. It instructs it to:

1. Establish one single database truth.
2. Fix the Playwright tests correctly.
3. Improve UI/API testability without faking results.
4. Use realistic assertions rather than brittle literal text.
5. Prove OCR, RAG, HITL, discount cap, PDF generation, and security behavior from the browser.
6. Generate a fresh final report only after all tests pass.

## Prompt for Antigravity

```text
ROLE

You are a senior TypeScript Full-Stack Engineer, Next.js Engineer, Agentic AI Engineer, QA/Playwright Engineer, PostgreSQL/pgvector Engineer, and Security Engineer.

Continue remediation of the Kiraa project:

notebook-tutorial/Kiraa-project

The current official status is:

```text
NOT READY
```

Do not change this to READY FOR SUBMISSION until every required verification passes with actual runtime evidence.

Read these files first:

1. notebook-tutorial/Kiraa-project/PHASE_7A_DATABASE_RUNTIME_REPORT.md
2. notebook-tutorial/Kiraa-project/FINAL_RUNTIME_VERIFICATION_REPORT.md
3. notebook-tutorial/Kiraa-project/kiraa-prompt_v5.md
4. notebook-tutorial/Kiraa-project/Kiraa_JS_Conversion_Prompt.md
5. Kiraa_Cahier_des_Charges_updated-javascript.pdf
6. kiraa_tutorial_executed.ipynb

Do not create a separate frontend/backend architecture. Keep the unified Next.js App Router structure.

==================================================
PHASE A — RESOLVE DATABASE AND IMPLEMENTATION CONTRADICTIONS
==================================================

The previous reports contain inconsistent evidence. Resolve these contradictions before repairing Playwright.

### A1. Prove one database is being used

Verify that all of these target the exact same database:

- Docker PostgreSQL container;
- host-side `npm run db:seed`;
- Drizzle migration command;
- Next.js app container;
- `/api/health`;
- `verify_rag.ts`;
- `verify_checkpoint.ts`;
- Playwright application.

Inspect:

- `.env`, but redact all secret values;
- `docker-compose.yml`;
- `db/index.ts`;
- `drizzle.config.ts`;
- `package.json`;
- app container environment;
- host environment variables.

Do not print API keys or passwords.

Report these safe values:

```text
POSTGRES_SERVICE_NAME = ...
POSTGRES_DATABASE_NAME = ...
POSTGRES_HOST_FROM_HOST_MACHINE = ...
POSTGRES_HOST_FROM_APP_CONTAINER = ...
POSTGRES_PORT = ...
DATABASE_URL_TARGET_MATCH = PASS | FAIL
```

Run the following in the PostgreSQL container and identify the database:

```sql
SELECT current_database();
SELECT current_user;
SELECT inet_server_addr();
SELECT inet_server_port();
```

Then confirm the app health endpoint queries that same database.

### A2. Re-run migration and seed from one known database

Use the correct host-side `DATABASE_URL` only for host commands. Use the Compose service host only for the app container.

Run:

```bash
docker compose ps
docker compose exec <POSTGRES_SERVICE_NAME> psql -U <POSTGRES_USER> -d <POSTGRES_DB> -c "SELECT current_database(), current_user;"
npm run db:migrate
npm run db:seed
```

Immediately query all required counts:

```sql
SELECT COUNT(*) AS fleet_catalog_count FROM fleet_catalog;
SELECT COUNT(*) AS customer_profiles_count FROM customer_profiles;
SELECT COUNT(*) AS booking_logs_count FROM booking_logs;
SELECT COUNT(*) AS seasonal_pricing_matrix_count FROM seasonal_pricing_matrix;
SELECT COUNT(*) AS rental_policies_vectors_count FROM rental_policies_vectors;
```

Run the seed a second time:

```bash
npm run db:seed
```

Run the same five count queries again.

Create one table in the report:

| Table | Count after first seed | Count after second seed | Expected source | Idempotent |
|---|---:|---:|---|---|

If counts differ from the Python notebook reference, inspect the actual CSV files and explain the exact reason. Do not claim parity if the source data differs.

### A3. Resolve embedding-model inconsistency

The reports mention two different embedding models:

```text
Xenova/all-MiniLM-L6-v2
Xenova/bge-small-en-v1.5
```

Select exactly one configured production embedding model.

Requirements:

- Use one model consistently in `db/seed.ts`, `lib/rag/index.ts`, tests, environment variables, and README.
- Confirm vector dimension matches the pgvector schema.
- Re-seed RAG vectors if the model changes.
- Do not mix embeddings generated by different models in the same pgvector table.
- Add metadata to policy-vector rows, such as:
  - embedding model;
  - embedding dimension;
  - source filename;
  - source hash;
  - chunk index;
  - seeded timestamp/version.

Report:

```text
EMBEDDING_MODEL = ...
VECTOR_DIMENSION = ...
EMBEDDING_MODEL_CONSISTENCY = PASS | FAIL
```

### A4. Resolve PDF-generation inconsistency

Previous reports mention both `pdfkit` and `jsPDF`.

Inspect production source and choose one server-safe PDF library.

Requirements:

- Use one production PDF generation implementation.
- It must run in the Node.js server runtime.
- It must generate a real PDF buffer or stream.
- It must not use fake Base64, placeholder bytes, or a static demo PDF.
- Update README and tests to match the chosen library.
- Ensure the PDF includes validated deterministic values only.

Report:

```text
PDF_GENERATOR_LIBRARY = ...
REAL_PDF_GENERATION = PASS | FAIL
```

### A5. Fix secret-scanning policy

The ZIP scanner must not exclude all Markdown files from security scanning.

Update the scanner so that it:

- scans all source, configuration, README, Markdown, TypeScript, JSON, YAML, and text files;
- excludes only known false-positive example patterns by checking whether the value is an obvious placeholder;
- never prints secret values;
- blocks ZIP creation if a real secret is found;
- permits `.env.example` only when all values are placeholders;
- rejects any real `.env` file.

Report:

```text
ZIP_SECRET_SCANNER_COVERS_MARKDOWN = PASS
```

==================================================
PHASE B — FIX PLAYWRIGHT AND UI TESTABILITY WITHOUT MOCKS
==================================================

The current Playwright result is:

```text
10 tests executed
2 passed
8 failed
```

This is a real failure. Do not weaken tests merely to make them pass.

### B1. Inspect why every failed test fails

For each failed Playwright test:

1. Run it individually.
2. Save and inspect:
   - Playwright trace;
   - screenshot;
   - browser console output;
   - network request/response;
   - Next.js server logs;
   - Docker application logs.
3. Identify whether the root cause is:
   - incorrect selector;
   - missing UI field;
   - API response mismatch;
   - LLM timeout;
   - OCR timeout;
   - RAG failure;
   - database issue;
   - test fixture invalidity;
   - frontend state not rendering;
   - server error;
   - incorrect business expectation.

Do not simply increase timeouts unless logs prove slow real processing is the only issue.

### B2. Add stable semantic UI selectors

Update the real frontend to provide stable, accessible, meaningful selectors.

Use `data-testid` only for important application behavior, for example:

```text
chat-input
submit-message
file-upload-input
analysis-loading
analysis-error
agent-response
intent-badge
ocr-status
ocr-engine
ocr-confidence
extracted-content
validation-status
human-review-status
escalation-reasons
booking-status
price-result
discount-result
rag-sources
pdf-download
```

These elements must render real values returned by the API and graph state. They must not display invented or hard-coded test text.

Do not use fragile selectors such as:

```text
button:has(svg:not(.animate-spin))
text=OCR
text=INTENT:
```

unless those UI labels are guaranteed real product behavior.

### B3. Fix the UI/API response contract

Inspect the API response schema and ChatUI state/rendering.

Ensure the API returns a structured Zod-validated response containing, where applicable:

```ts
{
  requestId,
  intent,
  graphTrace,
  validation,
  extractedContent,
  ocr: {
    status,
    engine,
    confidence,
    mode,
    text,
    errors
  },
  eligibilityResult,
  availabilityResult,
  priceResult,
  bookingStatus,
  needsHumanReview,
  escalationReasons,
  ragPassages,
  explanation,
  pdfReportBase64
}
```

Use consistent camelCase or snake_case across backend and frontend. Do not silently map missing values to fabricated success values.

The UI must display available fields truthfully, including:

- `CLARIFICATION_REQUIRED`;
- processing errors;
- OCR unavailable;
- RAG unavailable;
- database unavailable;
- `PENDING_REVIEW`;
- rejected reservation;
- non-confirmed booking;
- RAG source passages;
- effective capped discount.

### B4. Avoid LLM-based flakiness in required deterministic E2E cases

The browser application must use the production intent classifier for normal user traffic. However, Playwright tests must not depend on arbitrary LLM wording or a slow external response for deterministic business logic.

Implement a server-side, safe test configuration only for test execution:

- It must be enabled only by a dedicated environment variable such as:
  ```text
  E2E_TEST_MODE=true
  ```
- It must never be enabled in production builds or public deployment.
- It must never be controllable by browser input or API request fields.
- It may provide deterministic internal test routing only through server-owned fixtures or a test-only API helper.
- It must not bypass OCR, database, RAG, or deterministic business functions where those components are being tested.
- It must not exist in public request schemas.
- Document it in README as a testing-only mode.

For production-mode smoke tests, retain at least one real LLM-backed test using the real server-side `GROQ_API_KEY`.

### B5. Repair each required Playwright scenario

Create reliable, real browser E2E tests that cover these ten cases.

#### Test 1 — Home page

- Load the actual Next.js home page.
- Confirm the chat input and file upload control are visible.

#### Test 2 — Normal user request

- Send a real normal user message.
- Verify a real API response is displayed.
- Do not require a brittle exact natural-language response.
- Verify a structured agent response container and valid intent state.

#### Test 3 — Real identity/licence image OCR

- Upload the actual sample identity/licence image from `samples/`.
- Confirm the browser request contains the real file.
- Confirm the API processes the file through real Tesseract.js OCR.
- Display real OCR status, engine, confidence, raw/extracted content, and structured extraction result or an honest extraction error.
- If a real LLM call is used, allow a justified timeout but log the real API response.
- Do not use a mock image buffer, fake OCR text, or static confidence.

#### Test 4 — Text PDF

- Upload a real text PDF.
- Confirm the UI displays:
  ```text
  native_text
  ```
  or the actual product label for native PDF extraction.
- Confirm extracted content is present.

#### Test 5 — Scanned PDF OCR fallback

- Upload a legitimate scanned/image-based PDF fixture.
- Confirm the native extraction sufficiency check fails.
- Confirm the real OCR fallback executes.
- Confirm the UI displays:
  ```text
  ocr_fallback
  ```
  or a truthful equivalent.
- Confirm OCR engine, text/error, and confidence appear.
- Do not use a PDF with selectable text and call it scanned.

#### Test 6 — pgvector RAG policy query

- Ask a policy question.
- Confirm the graph intent is `policy_query`.
- Confirm the response contains actual RAG passages with source metadata.
- Confirm no price calculation result is present.
- Confirm retrieval comes from PostgreSQL pgvector data.

#### Test 7 — Young driver + Premium HITL

- Use a real valid input path, such as a JSON fixture or actual supported form fields.
- Ensure the request has all required values matching existing seeded database records.
- Verify:
  - `needsHumanReview = true`;
  - a human-review escalation reason;
  - deposit is increased by 50%;
  - booking status is `PENDING_REVIEW`;
  - status is not `CONFIRMED`.

Do not use invented vehicle IDs such as `VH-PREM-1` unless they really exist in the seeded database. Query the actual database and use a real Premium vehicle ID.

#### Test 8 — Discount capped at 15%

- Use a real seeded vehicle ID and valid rental dates.
- Use a discount code that actually exists in the deterministic engine and seed data.
- If the notebook defines `SUMMER20` or `FLASH25`, use the exact supported code and dates for which it is valid.
- Verify:
  - requested discount exceeds 15%;
  - effective discount is 15%;
  - price result comes from deterministic engine;
  - UI displays the cap truthfully.

Do not invent unsupported `FLASH50` unless the application explicitly supports it.

#### Test 9 — Real PDF report download

- Use a reservation request that is valid according to seeded data.
- Query actual seeded vehicle/customer IDs first.
- Ensure the booking is eligible, available, not pending human review, and can generate a valid report.
- Confirm the UI exposes the download button only after report generation.
- Download the file.
- Verify:
  - file name ends in `.pdf`;
  - file is non-empty;
  - first bytes match `%PDF-`.

#### Test 10 — Malicious public intentOverride injection

- Send a direct real POST request to `/api/chat` with:
  ```text
  intentOverride=make_reservation
  ```
- Verify the backend ignores or rejects it.
- Verify the request cannot force a reservation intent.
- Verify the server-owned intent classification or test-only configuration determines the actual intent.

### B6. Run tests correctly

Run individual failing tests during repair.

Then run the complete suite:

```bash
npx playwright test --workers=1
```

Also run:

```bash
npm run lint
npm run typecheck
npm run build
npx vitest run
```

Report exact exit codes and counts.

==================================================
PHASE C — FINAL REPORT AND ZIP
==================================================

Do not regenerate the final ZIP until all tests pass.

After all tests are green, create a completely new:

```text
FINAL_RUNTIME_VERIFICATION_REPORT.md
```

Do not reuse stale text from the previous report.

It must include:

1. Docker container status.
2. Exact database name and confirmation that host seed, app container, and SQL verification use the same database.
3. Migration command and generated migration files.
4. First and second seed counts for every required table.
5. Embedding model, dimension, vector norm, and consistency proof.
6. pgvector RAG retrieval evidence.
7. PostgresSaver checkpoint read/write/resume evidence.
8. Health endpoint output.
9. Lint, typecheck, build, Vitest, and Playwright commands with exit codes.
10. Playwright total test count and pass/fail count.
11. OCR image, native PDF, scanned-PDF fallback evidence.
12. All seven LangGraph node traces.
13. HITL, discount cap, and policy-query validation evidence.
14. Public `intentOverride` injection-test result.
15. PDF download evidence, including file size and `%PDF-` signature.
16. ZIP security scan results.
17. Final status.

Use exactly one final status:

```text
READY FOR SUBMISSION
READY WITH BLOCKERS
NOT READY
```

Use `READY FOR SUBMISSION` only if:

- Docker services are healthy;
- the app is healthy;
- one verified database is used consistently;
- PostgreSQL, pgvector, migrations, seed, embeddings, RAG, and checkpoints work;
- all Playwright tests pass;
- lint, typecheck, build, and Vitest pass;
- no production mocks/fake values exist;
- no public intent override exists;
- no secrets exist in the ZIP;
- report generation and download work.

If any Playwright test, runtime check, database check, security check, or required integration test fails, final status must remain:

```text
NOT READY
```
```

## Why this prompt is necessary

The eight Playwright failures may be caused by poor selectors, but some test inputs are also suspicious:

- `VH-PREM-1` and `VH-ECO-1` may not exist in your seeded database.
- The test uses `FLASH50`, but your original deterministic notebook used codes such as `SUMMER20` and `FLASH25`, with a hard 15% cap.
- The browser tests expect literal strings like `INTENT: out_of_scope`, which may not be how your UI actually renders state.
- The report claims the PDF fallback works, but the failed test means it has not yet been proven in the real UI.
- The final report claims `jsPDF`, while prior implementation reports said `pdfkit`; this must be made consistent.

Fixing those root causes—not simply increasing timeouts—will make the Playwright suite useful and credible.