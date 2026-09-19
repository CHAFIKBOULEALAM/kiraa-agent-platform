## Do not submit yet

Antigravity improved the project, but its newest report still contains critical contradictions. The project should remain **NOT READY** until those are corrected and independently verified.

The most serious problem is this statement:

> “The RAG system correctly pulls the 3 relevant vectorized chunks from the **in-memory store**.”

Your JavaScript specification requires RAG retrieval through **PostgreSQL + pgvector**, not an in-memory store. If the production RAG uses an in-memory store, the project does not satisfy the PostgreSQL/pgvector RAG requirement. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/151485498/b54c2391-70e4-4f79-80c6-d54b448631b7/Kiraa_Cahier_des_Charges_updated-javascript-2.pdf?AWSAccessKeyId=ASIA2F3EMEYEWPH5QEJ6&Signature=PpVJT5iVjcO4dGNFW0m%2B%2FHIYAMU%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEGYaCXVzLWVhc3QtMSJHMEUCIQCDqz9N2FscMJAcOEfPLBRcqrsHXkELl386En4NwmUUmwIgBPV5sgKaXSIfk2EN5YivLRNmLUnmkpb9SSDvoIQzlU0q8wQILhABGgw2OTk3NTMzMDk3MDUiDBCZH5vfo%2F5um29qxyrQBPXcG01HMhglSYDr%2Bc5BHn4FBB%2FdWJWsTxchF3IUTO9G8%2F9k1t2dklD6aTM1DSSY13GmigiLgSLHiYYcCaNpAwUkhPksDSkokAICS39mQ%2B9KKU%2FbzbYGplh0cZyQOT1i6rJA9BmeO9McwLCriG1ZP6CFDP5zsPt%2FTaFJMbkbZFqR1Uk4n9S5FD4O3SREIHphoKw3mxTlA5wDoehO5NeKex6nl%2FLYLvwAL7wPKSqEdA7ndDJrdHLYlyoFSzl7F8aa%2BDMRifqfk3u88XjMN2aViiVwiUN%2BETQk65HHvRRuQCOMD7CkIbQACq4LYLf0k579IWiCVDSR%2FFnzhypqck5SZQJZ0q25KwjtSlT63ylo2nW6PGrcMBvHVtw15EIifY8bjJydBthXRedogJ7uUeUMskf89hoomlAmvAF4rPeTbWQwmy0Fa%2BQXLY4JJmRo3q6JVPrV9NsK5XF6llOv2QK6NbrRE7%2Fi9irzMa%2FqoTqHwxa1XI2m0M5%2BLEGMXsjoFwJtLw8PBvpgRmMGauoplrNnRDYEke6YbWNMlMU%2Bhz1qwTF7iDTmVvLx1Mu9ihCZ7d3opBwn73nxUYPP%2BspMxJsVnQUyRWRO4tkxv9oWDYDHXOvfn9hb%2FU7XRCbxhQIHzQZgNEkPIN2aHHISpJRl1receaMEiswq3cjFP3%2B5hOtfHXub2pX3x5rXlJMt%2FAhWGRlrsNKuK6NRGzn9%2FckGXUU0q%2BFtafvxfeXdq0BKSrg5qEHozBywE6fmSThciU0jDIsRTYSz1yQfXxaJTY%2F%2FTO12XCkwk%2BGv1QY6mAE0cXWCA3maaffjYJZdYK%2B1u7Qed8RyeZGZfgHZWKGps6nz8G%2BdzkVqOI2Vs53iImvWxmPZjWkEORYTjAzyTDez1NfKQuxVFRsnfoUrFzC0ob5aitFhVdTHd6zuNCabvZMHnKSiC24O5lZM2d6NfkAB1CnqJE2rY4NpJwKB6INDHva1cPV0jlaytaWzm%2Fr1ak2tzQ27dsUEdQ%3D%3D&Expires=1789656678)

The second serious problem is the scanned-PDF result:

> “OCR fallback requires PDF-to-image rendering … which is not available in this environment.”

That means the scanned PDF OCR fallback is **not working**. It is correctly reporting an error, but that is not the same as implementing and proving the required fallback. The cahier des charges requires native PDF extraction first, then real OCR processing when the text is insufficient. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/151485498/b54c2391-70e4-4f79-80c6-d54b448631b7/Kiraa_Cahier_des_Charges_updated-javascript-2.pdf?AWSAccessKeyId=ASIA2F3EMEYEWPH5QEJ6&Signature=PpVJT5iVjcO4dGNFW0m%2B%2FHIYAMU%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEGYaCXVzLWVhc3QtMSJHMEUCIQCDqz9N2FscMJAcOEfPLBRcqrsHXkELl386En4NwmUUmwIgBPV5sgKaXSIfk2EN5YivLRNmLUnmkpb9SSDvoIQzlU0q8wQILhABGgw2OTk3NTMzMDk3MDUiDBCZH5vfo%2F5um29qxyrQBPXcG01HMhglSYDr%2Bc5BHn4FBB%2FdWJWsTxchF3IUTO9G8%2F9k1t2dklD6aTM1DSSY13GmigiLgSLHiYYcCaNpAwUkhPksDSkokAICS39mQ%2B9KKU%2FbzbYGplh0cZyQOT1i6rJA9BmeO9McwLCriG1ZP6CFDP5zsPt%2FTaFJMbkbZFqR1Uk4n9S5FD4O3SREIHphoKw3mxTlA5wDoehO5NeKex6nl%2FLYLvwAL7wPKSqEdA7ndDJrdHLYlyoFSzl7F8aa%2BDMRifqfk3u88XjMN2aViiVwiUN%2BETQk65HHvRRuQCOMD7CkIbQACq4LYLf0k579IWiCVDSR%2FFnzhypqck5SZQJZ0q25KwjtSlT63ylo2nW6PGrcMBvHVtw15EIifY8bjJydBthXRedogJ7uUeUMskf89hoomlAmvAF4rPeTbWQwmy0Fa%2BQXLY4JJmRo3q6JVPrV9NsK5XF6llOv2QK6NbrRE7%2Fi9irzMa%2FqoTqHwxa1XI2m0M5%2BLEGMXsjoFwJtLw8PBvpgRmMGauoplrNnRDYEke6YbWNMlMU%2Bhz1qwTF7iDTmVvLx1Mu9ihCZ7d3opBwn73nxUYPP%2BspMxJsVnQUyRWRO4tkxv9oWDYDHXOvfn9hb%2FU7XRCbxhQIHzQZgNEkPIN2aHHISpJRl1receaMEiswq3cjFP3%2B5hOtfHXub2pX3x5rXlJMt%2FAhWGRlrsNKuK6NRGzn9%2FckGXUU0q%2BFtafvxfeXdq0BKSrg5qEHozBywE6fmSThciU0jDIsRTYSz1yQfXxaJTY%2F%2FTO12XCkwk%2BGv1QY6mAE0cXWCA3maaffjYJZdYK%2B1u7Qed8RyeZGZfgHZWKGps6nz8G%2BdzkVqOI2Vs53iImvWxmPZjWkEORYTjAzyTDez1NfKQuxVFRsnfoUrFzC0ob5aitFhVdTHd6zuNCabvZMHnKSiC24O5lZM2d6NfkAB1CnqJE2rY4NpJwKB6INDHva1cPV0jlaytaWzm%2Fr1ak2tzQ27dsUEdQ%3D%3D&Expires=1789656678)

Finally, the report claims:

```text
10 passed
```

but also says real production LLM requests encountered a Groq `429 RateLimitQuotaExhaustedError`. It must prove that the ten passing tests did not simply use hidden test-mode behavior, fallback responses, or static UI data.

## What must happen next

Ask Antigravity to perform one final **forensic verification and targeted repair**:

1. Prove RAG is PostgreSQL pgvector, not in-memory.
2. Implement actual scanned-PDF rendering and OCR fallback.
3. Prove Playwright tests use real APIs and not mock responses.
4. Prove the final ZIP does not contain secrets.
5. Generate a final report only after all evidence is collected.

## Prompt for Antigravity

Copy this prompt exactly:

```text
ROLE

You are an independent senior Full-Stack TypeScript Engineer, PostgreSQL/pgvector Engineer, LangGraph.js Engineer, OCR Engineer, Playwright QA Engineer, DevOps Engineer, and Security Reviewer.

Do not trust the previous “ready” claim. Perform a final forensic audit and targeted repair of:

notebook-tutorial/Kiraa-project

The current report contains critical contradictions. The project is NOT READY until every issue below is resolved with real source and runtime evidence.

Read before changing anything:

1. notebook-tutorial/Kiraa-project/FINAL_RUNTIME_VERIFICATION_REPORT_v2.md
2. notebook-tutorial/Kiraa-project/PHASE_7A_DATABASE_RUNTIME_REPORT.md
3. notebook-tutorial/Kiraa-project/kiraa-prompt_v5.md
4. notebook-tutorial/Kiraa-project/Kiraa_JS_Conversion_Prompt.md
5. Kiraa_Cahier_des_Charges_updated-javascript.pdf
6. kiraa_tutorial_executed.ipynb

==================================================
CRITICAL ISSUE 1 — RAG MUST NOT USE IN-MEMORY STORAGE
==================================================

The previous report says:

```text
The RAG system correctly pulls the 3 relevant vectorized chunks from the in-memory store.
```

This is not compliant.

The production RAG must use PostgreSQL with pgvector. It must not use:

- in-memory arrays;
- in-memory vector stores;
- hard-coded policy passages;
- keyword-only fake retrieval;
- test fixture retrieval;
- static RAG responses.

Inspect:

```text
lib/rag/index.ts
db/seed.ts
db/schema.ts
lib/agent/nodes/explainer.ts
lib/agent/nodes/calculator.ts
lib/agent/graph.ts
app/api/chat/route.ts
```

Required repair and proof:

1. Ensure RAG chunks come only from `rental_policies.md`.
2. Ensure embeddings are stored in `rental_policies_vectors` in PostgreSQL.
3. Ensure retrieval executes a real pgvector query using cosine distance.
4. Ensure the production graph calls this PostgreSQL RAG function only when:
   ```text
   intent === policy_query
   ```
5. Remove any in-memory RAG fallback from production.
6. If PostgreSQL/pgvector is unavailable, return a controlled RAG/database-unavailable status. Do not silently use in-memory retrieval.
7. Add a database query log or safe test instrumentation proving actual SQL pgvector retrieval occurred.
8. Run a policy query through the real API and browser UI:
   ```text
   Puis-je annuler gratuitement 24 heures avant la prise en charge ?
   ```
9. Report:
   - SQL query pattern used;
   - actual retrieved database row IDs;
   - source file metadata;
   - similarity scores;
   - safe passage excerpts;
   - API response;
   - visible UI source citation.

Required final evidence:

```text
RAG_BACKEND = POSTGRESQL_PGVECTOR
RAG_IN_MEMORY_FALLBACK = DISABLED
RAG_POLICY_QUERY_TEST = PASS
RAG_NON_POLICY_QUERY_TEST = PASS
```

For the non-policy query test, prove that a pricing request does not call RAG.

==================================================
CRITICAL ISSUE 2 — REAL SCANNED-PDF OCR FALLBACK
==================================================

The previous report says the scanned PDF fallback failed because poppler/canvas was unavailable.

This does not meet the requirement. A controlled error is better than a fake result, but the project must implement and prove a working OCR fallback for scanned/image-based PDFs.

Required implementation:

```text
PDF upload
→ native text extraction
→ text sufficiency check
→ if insufficient:
   render each PDF page to a real image
   run Tesseract.js on each rendered image
   combine OCR text
   return mode = ocr_fallback
```

Choose one real Node.js-compatible PDF rendering approach and document it:

- `pdfjs-dist` with `canvas`;
- Poppler command-line tools installed in Docker;
- another stable Node.js-compatible page renderer.

Requirements:

1. Add required system dependencies to Dockerfile if needed, for example Poppler packages or canvas dependencies.
2. Ensure the solution works inside the Docker application container, not only on a local host.
3. Create a genuine scanned PDF fixture consisting only of an embedded image, with no selectable text.
4. Prove native text extraction returns insufficient text for that fixture.
5. Prove the rendering step creates a temporary page image.
6. Prove Tesseract.js processes the rendered image.
7. Return actual OCR text, actual confidence, actual errors, and actual human-review status.
8. Clean up temporary rendered files in a `finally` block.
9. Display `ocr_fallback` in the API response and UI.
10. Re-run Playwright T5 against the real fixture.

Required evidence:

```text
SCANNED_PDF_NATIVE_TEXT_LENGTH = <number below threshold>
SCANNED_PDF_RENDERED_PAGE_COUNT = <number>
SCANNED_PDF_OCR_ENGINE = tesseract.js
SCANNED_PDF_OCR_TEXT_EXCERPT = <real OCR text>
SCANNED_PDF_OCR_CONFIDENCE = <actual value>
SCANNED_PDF_MODE = ocr_fallback
SCANNED_PDF_TEMP_FILES_CLEANED = PASS
```

Do not accept a missing-dependency error as a PASS.

==================================================
CRITICAL ISSUE 3 — PROVE PLAYWRIGHT IS NOT MOCKING THE APP
==================================================

Inspect every Playwright test, `playwright.config.ts`, application environment, API route, graph, OCR module, RAG module, and reporter.

Search for:

```text
page.route
route.fulfill
route.abort
mock
fake
dummy
simulate
stub
fixture response
static response
E2E_TEST_MODE
short-circuit
bypass
skip
```

For every match, classify it:

```text
ALLOWED_TEST_FIXTURE
ALLOWED_INTENT_ROUTING_ONLY
FORBIDDEN_PRODUCTION_BYPASS
FORBIDDEN_TEST_BYPASS
```

Rules:

- Test fixtures are allowed as uploaded input files.
- `E2E_TEST_MODE` may only choose the server-owned intent for deterministic tests.
- `E2E_TEST_MODE` must never bypass or fake OCR, PDF processing, PostgreSQL, pgvector RAG, PostgresSaver, deterministic engine, Zod validation, PDF generation, or UI rendering.
- Playwright must never use `page.route()` or `route.fulfill()` to fake `/api/chat`, OCR, RAG, database, or report responses.
- Playwright must connect to the real Next.js server and real Docker PostgreSQL database.

Run the complete Playwright suite with trace enabled:

```bash
npx playwright test --workers=1 --trace on
```

For every test, provide:

- test name;
- HTTP request endpoint;
- response status;
- graph trace;
- database proof where relevant;
- screenshot/trace path;
- pass/fail status.

Do not state “10/10 PASS” unless the final Playwright console output literally says:

```text
10 passed
```

and no test is skipped, retried into hidden failure, expected-failure, or mocked.

==================================================
CRITICAL ISSUE 4 — PROVE POSTGRESH SAVER IS REAL
==================================================

The report says checkpoint count is 824, but this alone is insufficient.

Prove that a checkpoint is created by the real application route and not only by an isolated script.

1. Query the checkpoint count before an API request.
2. Send a real request to `/api/chat` with a known server-generated request/thread ID.
3. Query checkpoint count afterward.
4. Show that new rows correspond to that thread ID.
5. Restart the app container without deleting the PostgreSQL volume.
6. Send another request with the same thread/session ID.
7. Prove the prior state is resumed from PostgreSQL.

Report:

```text
POSTGRES_SAVER_API_WRITE = PASS
POSTGRES_SAVER_APP_RESTART_RECOVERY = PASS
CHECKPOINT_COUNT_BEFORE = ...
CHECKPOINT_COUNT_AFTER = ...
THREAD_ID = <safe test ID>
```

==================================================
CRITICAL ISSUE 5 — VERIFY PRODUCTION MODE SEPARATELY
==================================================

Run two different verification modes.

### Mode A — E2E test mode

Use:

```text
E2E_TEST_MODE=true
```

Only to make deterministic intent routing stable. Verify all other components remain real.

### Mode B — Production mode

Use:

```text
E2E_TEST_MODE=false
```

or leave it unset.

Run at least these production-mode smoke tests with a real configured LLM:

1. A policy query.
2. An eligibility query.
3. Image upload with OCR and structured extraction.

If Groq returns 429 or external quota failure:

- report it honestly;
- do not pretend production mode passed;
- do not call the project READY FOR SUBMISSION;
- state `READY WITH BLOCKERS` or `NOT READY`.

Do not use an artificial intent route, fake LLM response, or local mock in production mode.

==================================================
CRITICAL ISSUE 6 — SECURITY AND FINAL ZIP
==================================================

Do not regenerate the ZIP until all critical issues above pass.

Perform a strict archive scan that includes:

- TypeScript;
- TSX;
- JavaScript;
- JSON;
- YAML;
- Docker files;
- Markdown;
- README;
- scripts;
- data;
- sample files.

Do not skip all Markdown files.

Confirm final ZIP excludes:

```text
.env
.env.local
.env.production
.env.development
node_modules
.next
Docker volumes
logs
test-results
playwright-report
temporary OCR files
```

Confirm it includes:

```text
.env.example
README.md
Dockerfile
docker-compose.yml
migrations
db/schema.ts
db/seed.ts
tests
Playwright config
sample files
CSV data
rental_policies.md
```

Report:

```text
ZIP_SECRET_SCAN = PASS | FAIL
ZIP_ENV_SCAN = PASS | FAIL
ZIP_NODE_MODULES_SCAN = PASS | FAIL
ZIP_NEXT_SCAN = PASS | FAIL
ZIP_TEST_ARTIFACT_SCAN = PASS | FAIL
ZIP_MARKDOWN_SCAN = PASS | FAIL
```

==================================================
FINAL VERIFICATION COMMANDS
==================================================

After repairing the issues, run all commands and report exact exit codes:

```bash
docker compose down
docker compose up -d --build
docker compose ps
docker compose logs --tail=300
npm run db:migrate
npm run db:seed
npm run db:seed
npm run lint
npm run typecheck
npm run build
npx vitest run
npx playwright test --workers=1 --trace on
```

Then run:

```bash
curl -i http://localhost:3000/api/health
```

==================================================
FINAL REPORT
==================================================

Create a completely new report:

```text
FINAL_FORENSIC_RUNTIME_REPORT.md
```

Do not reuse previous report wording.

The report must include literal evidence for:

1. Docker health.
2. PostgreSQL and pgvector verification.
3. Migration and safe idempotent seed.
4. Real non-zero embeddings.
5. Real pgvector RAG retrieval, not in-memory retrieval.
6. PostgresSaver checkpoint persistence via the real `/api/chat` route and after app restart.
7. Real JPG OCR.
8. Real text-PDF extraction.
9. Real scanned-PDF rendering plus Tesseract OCR fallback.
10. Production-mode LLM smoke tests.
11. E2E-test-mode limits and proof it affects intent routing only.
12. Playwright test output and traces.
13. No mocked/static production behavior.
14. PDF report generation/download.
15. ZIP security scan.

Use exactly one final status:

```text
READY FOR SUBMISSION
READY WITH BLOCKERS
NOT READY
```

You may use `READY FOR SUBMISSION` only if every required check above passes with real runtime evidence.

If RAG uses in-memory retrieval, scanned-PDF OCR fallback does not actually work, production-mode LLM is unavailable, Playwright has mocked component behavior, checkpoint recovery is not proven through the real API, or any test fails, do not use READY FOR SUBMISSION.
```

## Bottom line

The next step is not simply “submit the ZIP.” The next step is to force Antigravity to prove that:

- RAG is genuinely PostgreSQL + pgvector;
- scanned PDFs genuinely run through OCR fallback;
- Playwright uses real infrastructure;
- the production app works without hidden test shortcuts;
- checkpointing works through the actual API route.

Only after this final forensic review passes should you submit the archive.