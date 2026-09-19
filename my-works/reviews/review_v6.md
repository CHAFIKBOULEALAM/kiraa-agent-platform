## Current verdict

Do **not** accept Antigravity’s statement that the project is ready or that “all code, routing, and UI elements are correct.” The reported result is still:

```text
8 passed, 2 failed
```

That is a failing E2E suite, regardless of whether the cause is a Groq rate-limit error. The project should remain:

```text
FINAL_STATUS = NOT READY
```

until all required E2E scenarios pass with real evidence.

## Critical concerns in Antigravity’s summary

| Finding | Why it matters |
|---|---|
| T7 and T8 failed due to Groq quota | The test suite does not currently prove the required Premium/HITL and discount-cap browser scenarios. “Would pass tomorrow” is not evidence |
| `scanned_document.pdf` was created by copying `sample_test_document.pdf` | This is likely **not a real scanned PDF**. Copying a text PDF does not exercise the OCR fallback. It may falsely pass T5 while using native extraction |
| Test mode may bypass LLM logic | `E2E_TEST_MODE=true` can be acceptable only if it is server-only, temporary, and still exercises database, RAG, OCR, deterministic engine, reporter, and PostgreSQL checkpoints. It must not be used to fake results |
| Playwright tests may have weak assertions | Earlier tests only looked for generic elements such as `OCR`, `INTENT`, or UI labels. They must validate actual API-backed result values |
| ZIP created with failed tests | The ZIP should not be presented as final submission while the official report still says `NOT READY` |
| “No secrets in ZIP” needs independent proof | The scanner was changed to ignore certain known strings. It must scan source and Markdown safely, without broadly skipping files |
| Database report counts changed across sessions | Antigravity must prove the app, seed script, tests, and SQL checks use the same database/container |
| `qwen/qwen3.8-27b` quota dependency | The final system must handle LLM quota exhaustion safely and Playwright should use a controlled test mode only where appropriate, without bypassing required real components |

The cahier des charges requires real OCR/PDF processing, persistent PostgreSQL/pgvector data, LangGraph state persistence, deterministic TypeScript business logic, RAG policy retrieval, a Next.js UI, Docker Compose, and testing. Browser test failures mean those requirements are not fully verified yet. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/151485498/b54c2391-70e4-4f79-80c6-d54b448631b7/Kiraa_Cahier_des_Charges_updated-javascript-2.pdf?AWSAccessKeyId=ASIA2F3EMEYERLMVFVZH&Signature=2VPvzLTztcgej4UBHTR%2FyciKPGE%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEGMaCXVzLWVhc3QtMSJIMEYCIQDwAaJz8q1kor33TiMEqBOWJPWu0xhHZbGhIv7tgFAAPQIhAP8XKe6NUpwW47hTJBRAtsuvjmzkqeJnRhAgbqCR9tTuKvMECCwQARoMNjk5NzUzMzA5NzA1IgxJOalr8ls3PiE2R%2F0q0ASb5azdoB7WOe20T8%2BUjlvdBQF59%2FFq7LN%2FXMa7sWKTFaV7kIte5kynDcHxB0bYAUwJ%2B2d%2BKpkd3vZOzv9kmiK1zFcW468xCB7yBS4%2FohIXE2aZ1trQuWtbTjFIHnk4ay928b8O3MzKKZ1CV7tYyd2AWAkW7iIWcpbq1Nkg6yqJebFTW7EIzMKNRAeCzUyBdsWas3KIcgUzTTxOdfqisxK%2Bw%2BP0M2gkz4KGwC3W0Qmn9WV%2BjOln7ehCJTP%2BZ%2BGGjRpXW4%2FEK3uA%2ByQKg3TQVSx2HgZryKXOe4pXJCxaQHn6ee5tHLPTr9qVpa0adJlivLWXi4V%2B3X4wo48S%2F7D7gFFQFm%2BLtSoxi7ND2grC5aAEhPhoL2%2B8yfjmlNtMLWp8YTNbD%2F1kAc4qboUGcyKXv1FiWs%2FIKPPoU4s0jS0MFP6nzh7UoqjzhSR1f4nUgUZoLRbjnCT8m25Ul7rL77QVq0kyQoFazyJ0xVBx%2BB6XIWZOVHrcbD5CaYPONOUCkEh0o03OkzgFwSCEg2ywBSq3fn7GktyHQcibA2kem1Vr14f%2BhkgXodujP3PgQ7Fl9E1X%2FtkRCdubKC%2BBqs7UcuuQRdIIG%2BbelG%2B3ffA3DHQChSLlClTnOk%2FEJstUeGi8h43f%2B5mYiAYLPJp8ylYa%2FQVulBbxWHcVetB%2F7PajWiVgPyTCMT535WEGIxcCk%2FLUZ8MNHMGuVOCF%2ByY0C%2FesX8gVMzFsfD%2FOKu6sdXqeDzcbxzuo5xsaFqbz%2FTOR23WHniyuYesZWPB4MH%2BQulCVILfltN8PMOqKr9UGOpcBx8y7EumeUc3f%2F9kv%2BDXGGSWPQ7sk7aMWXysRWklAMVSHB9pdAv8IN02EFRenj7Yc4nQS0Bp4pEtxOreGM7JiM49nSaoy6eMRYB4jJTjHeG7AosVQa%2B8TstfJ5mo3BGggp169JdPcWp1WYtmJwEo4%2B7bGk6F%2Fpg2rvEAdJleQJNdjErk8TL5YWzFo38fHmM7KH1gyQhIOPg%3D%3D&Expires=1789645629)

## Prompt for Antigravity

Copy this exact prompt into Antigravity. It is intentionally an **independent verification and repair prompt**, not a “trust the existing report” prompt.

```text
ROLE

You are an independent senior Full-Stack TypeScript Engineer, Agentic AI Architect, PostgreSQL/pgvector Engineer, QA Engineer, Playwright Specialist, DevOps Engineer, and Security Reviewer.

Perform a strict final remediation and verification of the Kiraa project:

notebook-tutorial/Kiraa-project

Read these sources before changing anything:

1. notebook-tutorial/Kiraa-project/Kiraa_JS_Conversion_Prompt.md
2. notebook-tutorial/Kiraa-project/kiraa-prompt_v5.md
3. notebook-tutorial/Kiraa-project/PHASE_7A_DATABASE_RUNTIME_REPORT.md
4. notebook-tutorial/Kiraa-project/FINAL_RUNTIME_VERIFICATION_REPORT.md
5. notebook-tutorial/Kiraa-project/review_v3.md
6. notebook-tutorial/Kiraa-project/review_v4.md
7. notebook-tutorial/Kiraa-project/review_v5.md
8. Kiraa_Cahier_des_Charges_updated-javascript.pdf
9. kiraa_tutorial_executed.ipynb

The current official state is:

```text
FINAL_STATUS = NOT READY
```

The project has 8 passing and 2 failing Playwright tests. Do not state or imply that the project is ready until all required runtime checks and all browser tests pass.

Do not create a separate frontend/backend architecture. Keep the unified Next.js App Router project.

==================================================
NON-NEGOTIABLE AUDIT RULES
==================================================

1. Do not trust previous reports, task trackers, comments, or status labels.
2. Verify source code and runtime behavior.
3. Do not weaken, skip, delete, quarantine, mark as expected failure, or fake any test merely to obtain a PASS result.
4. Do not replace real OCR, real PDF fallback, real pgvector retrieval, real PostgresSaver checkpointing, real PDF generation, or real API/UI behavior with fixtures, static results, mocks, or hard-coded success values.
5. A test fixture is allowed only as input data. It must travel through the real production path.
6. Do not claim “rate limit only, code is correct.” A failed test remains a failure until it is rerun successfully with evidence.
7. Do not regenerate, label, or present the submission ZIP as final while the project is NOT READY.
8. Never print, expose, copy, or preserve real API keys, database passwords, or `.env` content.
9. Never accept `intentOverride` or test-mode controls from public API input, browser input, FormData, query parameters, or client-side code.
10. Every final PASS must include source evidence plus actual command/runtime evidence.

==================================================
PHASE 1 — VERIFY THE CURRENT PROJECT, NOT CLAIMS
==================================================

First inspect the full current project tree and identify all production code, test code, fixtures, Docker files, database files, migrations, seed scripts, RAG files, and report generators.

Inspect at minimum:

```text
package.json
playwright.config.ts
vitest.config.ts
docker-compose.yml
Dockerfile
.env.example
.gitignore
.dockerignore
db/schema.ts
db/index.ts
db/seed.ts
db/migrations/
lib/engine/
lib/ingestor/
lib/rag/
lib/agent/graph.ts
lib/agent/nodes/
app/api/chat/route.ts
app/api/health/route.ts
components/ChatUI.tsx
tests/
samples/
scratch/create_secure_zip.py
```

Create a source inventory table:

| Component | File(s) | Exists | Imported in production | Runtime proof available | Status |
|---|---|---|---|---|---|

Do not classify a file as functional merely because it exists.

==================================================
PHASE 2 — SEARCH FOR MOCKS, STATIC RESPONSES, AND FAKE PATHS
==================================================

Search every production source file, including TypeScript, TSX, JavaScript, JSON, YAML, Docker files, README, scripts, and Markdown files.

Search for:

```text
mock
fake
dummy
simulated
placeholder
hardcoded
static response
test-only
E2E_TEST_MODE
MemorySaver
pdfBytesMock
pdfReportBase64
Array(384).fill(0)
Array(...).fill(0)
Math.random
success: true
TODO
FIXME
scanned_document.pdf
```

For every match, classify it as one of:

```text
LEGITIMATE_TEST_FIXTURE
SAFE_BUILD_PLACEHOLDER
PRODUCTION_MOCK
PRODUCTION_STATIC_VALUE
SECURITY_RISK
REQUIRES_MANUAL_REVIEW
```

Rules:

- Test fixtures are allowed only under test/fixture directories and must not be imported by production paths.
- `E2E_TEST_MODE` must be server-side only and must never be enabled for production Docker execution.
- A build-time dummy key must not appear in client bundles, final images, logs, or runtime environment.
- `MemorySaver` must not be used in production graph creation.
- Any hard-coded identity data, OCR text, RAG answer, confidence score, price, eligibility, PDF content, or graph trace in production code is a critical failure.
- Do not exclude all `.md` files from secret scans. Markdown must be scanned too.

Create:

```text
MOCK_AND_STATIC_VALUE_AUDIT.md
```

with every match, exact file, line, classification, and remediation status.

==================================================
PHASE 3 — FIX THE SCANNED PDF TEST HONESTLY
==================================================

The previous implementation reportedly created:

```text
samples/scanned_document.pdf
```

by copying:

```text
samples/sample_test_document.pdf
```

This is not acceptable unless the copied source PDF is genuinely image-based and contains no usable native text.

Verify the file with a real native extraction check:

1. Extract native text from `samples/scanned_document.pdf`.
2. Measure the text length.
3. Confirm whether it is truly scanned/image-based.

If it contains sufficient selectable/native text, it is NOT a valid scanned-PDF fixture.

In that case:

1. Create a genuine scanned-PDF fixture only under a test fixture path, for example:

```text
tests/fixtures/scanned_identity_document.pdf
```

2. Build it from an image using a real PDF library, preserving the image-only nature.
3. Confirm native text extraction returns insufficient text.
4. Upload it through the real Playwright browser path.
5. Confirm the production pipeline enters actual:

```text
ocr_fallback
```

6. Confirm Tesseract.js is called and returns real OCR text or an honest OCR failure.
7. Confirm UI displays the actual mode, OCR engine, confidence, extracted output, errors, and human-review status.

Do not copy a text PDF and call it a scanned PDF.

==================================================
PHASE 4 — REPAIR PLAYWRIGHT ROOT CAUSES
==================================================

Current result:

```text
10 tests total
8 passed
2 failed:
- T7 Young driver + Premium HITL
- T8 Discount capped at 15%
```

Do not simply increase timeouts and do not treat the failures as acceptable.

For T7 and T8:

1. Run each test individually using:

```bash
npx playwright test tests/e2e/chat.spec.ts --grep "Young driver" --workers=1 --trace on
npx playwright test tests/e2e/chat.spec.ts --grep "Discount" --workers=1 --trace on
```

2. Capture:
   - browser screenshot;
   - Playwright trace;
   - browser console;
   - request payload;
   - response status/body with secrets redacted;
   - Next.js logs;
   - Docker app logs;
   - PostgreSQL logs if relevant.

3. Determine the true cause:
   - external LLM quota;
   - wrong fixture data;
   - invalid database ID;
   - missing UI display;
   - API validation issue;
   - graph routing error;
   - broken test selector;
   - PostgresSaver failure;
   - RAG error;
   - incorrect business expectation.

4. Fix the actual root cause.

==================================================
PHASE 5 — SAFE E2E TEST MODE
==================================================

`E2E_TEST_MODE` is allowed only for deterministic routing, not for faking the application.

Verify and enforce:

1. It is enabled only by Playwright server environment.
2. It is not present as `true` in `.env`, `.env.example`, Docker Compose production runtime configuration, Docker image, or final ZIP.
3. It is not available in public request input.
4. It only replaces external LLM intent classification when running browser tests.
5. It does not bypass:
   - PostgreSQL;
   - pgvector;
   - RAG retrieval;
   - PostgresSaver;
   - real OCR;
   - PDF native extraction;
   - scanned-PDF OCR fallback;
   - deterministic engine;
   - Zod validation;
   - reporter PDF generation;
   - UI/API response rendering.

For T7 and T8 specifically:

- Do not make them depend on Groq token quotas.
- Under `E2E_TEST_MODE=true`, use a server-owned deterministic intent routing mechanism that routes valid test inputs to the correct intent.
- The test must still execute the real database, graph, validator, calculator, reporter, and UI.
- Keep at least one separate production-mode smoke test using the real LLM, but do not make the entire browser suite fail because an external free-tier quota is exhausted.

Add tests proving that a browser/API client cannot activate `E2E_TEST_MODE` or choose an intent.

==================================================
PHASE 6 — USE REAL DATABASE DATA
==================================================

Do not use fabricated IDs in tests.

Query the actual PostgreSQL database and select valid IDs from the seeded data:

```sql
SELECT vehicle_id, category FROM fleet_catalog WHERE category = 'Premium' LIMIT 1;
SELECT vehicle_id, category FROM fleet_catalog WHERE category = 'Economy' LIMIT 1;
SELECT customer_id FROM customer_profiles LIMIT 1;
```

Use the exact real returned identifiers in tests.

Verify all current table counts in the exact database used by Docker app, host seed, Playwright, and SQL shell:

```sql
SELECT COUNT(*) FROM fleet_catalog;
SELECT COUNT(*) FROM customer_profiles;
SELECT COUNT(*) FROM booking_logs;
SELECT COUNT(*) FROM seasonal_pricing_matrix;
SELECT COUNT(*) FROM rental_policies_vectors;
```

Run `npm run db:seed` twice without truncating the database.

Verify:

- no duplicate records;
- no loss of unrelated records;
- one consistent embedding model;
- all stored embeddings non-zero;
- vector dimension is exactly 384 if using `Xenova/all-MiniLM-L6-v2`.

==================================================
PHASE 7 — REVALIDATE REAL PRODUCTION PATHS
==================================================

Test the following through the real production API and UI. Test mode may control only intent routing as defined above.

### Scenario 1 — Normal request

- UI loads.
- Message reaches `/api/chat`.
- Real structured response renders.

### Scenario 2 — JPG OCR

- Upload the actual JPG sample.
- Confirm real Tesseract.js processing.
- Confirm actual OCR text or a truthful OCR error.
- Confirm structured extraction uses that OCR output.
- Confirm Zod validates or rejects extraction honestly.

### Scenario 3 — Text PDF

- Upload the actual text PDF.
- Confirm `native_text` mode.
- Confirm extracted text appears.

### Scenario 4 — Scanned PDF

- Upload the genuine image-based scanned PDF fixture.
- Confirm `ocr_fallback` mode.
- Confirm real Tesseract invocation.
- Confirm UI result is truthful.

### Scenario 5 — Policy RAG query

- Ask a cancellation question.
- Confirm `policy_query`.
- Confirm pgvector retrieval is performed.
- Confirm source chunks from `rental_policies.md` display.
- Confirm no price result exists.

### Scenario 6 — Young driver Premium HITL

Use valid real data and a proper request.

Verify through API and browser:

```text
needsHumanReview = true
bookingStatus = PENDING_REVIEW
escalationReasons is non-empty
deposit is exactly 1.5 × base deposit
booking is not confirmed
```

### Scenario 7 — Discount cap

Use valid real data and an existing valid discount code from the deterministic engine.

Verify:

```text
requested discount > 15%
effective discount = 15%
discountCapped = true
price is calculated by deterministic TypeScript code
```

### Scenario 8 — Public injection protection

Send a real public API request containing:

```text
intentOverride=make_reservation
E2E_TEST_MODE=true
```

Verify neither input can alter server-owned routing.

### Scenario 9 — PDF download

Use a valid, available, eligible scenario.

Verify:

- report is generated;
- UI shows download only after generation;
- file has non-zero size;
- first bytes are `%PDF-`;
- status is not falsely confirmed when human review is required.

==================================================
PHASE 8 — FULL COMMAND VERIFICATION
==================================================

Before finalizing, run all commands and report exact exit codes:

```bash
docker compose ps
docker compose logs --tail=250
npm run lint
npm run typecheck
npm run build
npx vitest run
npx playwright test --workers=1
```

Playwright must finish with all required tests passing.

Do not call the project ready if one test fails, times out, is skipped, is quarantined, is marked expected failure, or requires a future quota reset.

==================================================
PHASE 9 — FINAL SECURE ZIP
==================================================

Do not create a new final ZIP until every previous test passes.

The archive must include:

- source code;
- package.json;
- package lockfile;
- Dockerfile;
- docker-compose.yml;
- Drizzle migrations;
- db schema and seed;
- tests;
- Playwright config;
- real sample/fixture files;
- README;
- `.env.example`.

It must exclude:

- `.env`;
- all secrets;
- `node_modules`;
- `.next`;
- test results;
- Playwright reports/traces/screenshots when they contain sensitive data;
- Docker volume data;
- temporary OCR files;
- local logs.

Run a strict scan on the ZIP and all included files.

Do not broadly ignore Markdown files. Scan Markdown, README, scripts, source, configuration, and data safely.

Report:

```text
ZIP_SECRET_SCAN = PASS | FAIL
ZIP_ENV_SCAN = PASS | FAIL
ZIP_NODE_MODULES_SCAN = PASS | FAIL
ZIP_NEXT_SCAN = PASS | FAIL
ZIP_TEST_ARTIFACT_SCAN = PASS | FAIL
```

==================================================
PHASE 10 — NEW FINAL REPORT
==================================================

Create a new report only after all work is complete:

```text
FINAL_RUNTIME_VERIFICATION_REPORT.md
```

It must replace, not append to, stale reports.

Include:

1. Current revision/date.
2. Files changed.
3. Docker health.
4. Current database identity and table counts.
5. Migration and seed idempotency evidence.
6. Embedding model, dimension, vector norm, and real retrieval evidence.
7. PostgresSaver checkpoint read/write/resume evidence.
8. Lint, typecheck, build, Vitest, and Playwright exact results.
9. Source and runtime evidence for no production mocks.
10. Real OCR/image test evidence.
11. Native PDF test evidence.
12. Genuine scanned-PDF OCR fallback evidence.
13. RAG policy-query evidence.
14. Young-driver Premium HITL evidence.
15. Discount-cap evidence.
16. Public injection-protection evidence.
17. Real PDF report/download evidence.
18. ZIP security scan evidence.
19. Remaining blockers, if any.
20. Final status.

Use exactly one final status:

```text
READY FOR SUBMISSION
READY WITH BLOCKERS
NOT READY
```

Use `READY FOR SUBMISSION` only when all 10 Playwright tests, all static commands, all database checks, all security scans, and all real implementation checks pass.

If even one runtime or E2E test fails because of quota, timeout, missing UI, wrong data, mock behavior, or unavailable external service, use:

```text
NOT READY
```
```

## Your next step

Give Antigravity the prompt above. Do not accept the current ZIP v3 as final, because the most recent verified result is still **8/10**, not 10/10.