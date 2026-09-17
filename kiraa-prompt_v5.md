ROLE

You are a senior TypeScript Full-Stack Engineer, PostgreSQL/pgvector Engineer, LangGraph.js Engineer, QA Engineer, DevOps Engineer, and Security Engineer.

Perform the final remediation and verification of the Kiraa JavaScript project located at:

notebook-tutorial/Kiraa-project

Use these binding references:

1. notebook-tutorial/Kiraa-project/Kiraa_JS_Conversion_Prompt.md
2. Kiraa_Cahier_des_Charges_updated-javascript.pdf
3. kiraa_tutorial_executed.ipynb for exact deterministic business logic parity.

IMPORTANT OPERATING RULES

- Do not create a separate frontend/backend architecture. Keep the current unified Next.js App Router project.
- Do not claim READY FOR SUBMISSION until Docker, PostgreSQL, pgvector, migrations, seed, RAG, LangGraph checkpoints, API, UI, and Playwright tests are actually executed and verified.
- Do not use source-code presence, comments, or prior reports as proof of functionality.
- Do not use mocked OCR, mocked RAG, dummy embeddings, static UI response objects, fake PDF bytes, `MemorySaver` production fallback, or a fake health endpoint.
- Do not expose, print, commit, archive, or reuse any real API key, password, or `.env` file.
- Do not update the final readiness report until all current checks have been executed again from scratch.
- Do not edit old audit findings into a new conclusion. Generate a new report using current source and current command outputs.

==================================================
PHASE 0 — SECURITY FIRST
==================================================

A previously leaked Groq API key must be considered compromised.

1. Do not print or copy the old key.
2. Confirm that `.env` is excluded by:
   - `.gitignore`
   - `.dockerignore`
   - ZIP generation script
3. Confirm the final submission ZIP excludes:
   - `.env`
   - `.env.local`
   - `.env.production`
   - `.env.development`
   - all files containing real API keys or database passwords
   - node_modules
   - .next
   - Docker volumes
   - logs
   - temporary OCR files
4. Keep `.env.example` in the ZIP, but it must contain placeholders only.
5. Scan the final project and the final ZIP for secret patterns:
   ```text
   gsk_
   sk-
   GROQ_API_KEY=<non-placeholder>
   DATABASE_URL=postgresql://<real-user>:<real-password>
   ```
6. Do not print the matched secret. Report only:
   - file path;
   - key type;
   - whether it is a placeholder or a real secret.
7. If a real secret appears in source, README, Git-tracked files, or ZIP archive, stop and report:
   ```text
   SECURITY BLOCKER — NOT READY FOR SUBMISSION
   ```

==================================================
PHASE 1 — FIX PRODUCTION CHECKPOINTING
==================================================

Inspect and correct `lib/agent/graph.ts`.

The current implementation must NOT use this production fallback:

```ts
process.env.DATABASE_URL ? PostgresSaver : new MemorySaver()
```

This is not acceptable for production compliance because it silently replaces persistent PostgreSQL state with in-memory state.

Required behavior:

1. Production graph must use `PostgresSaver` from:
   ```ts
   @langchain/langgraph-checkpoint-postgres
   ```

2. Use a real PostgreSQL connection from:
   ```text
   DATABASE_URL
   ```

3. Initialize the PostgreSQL checkpoint tables using the actual supported API for the installed version of `@langchain/langgraph-checkpoint-postgres`.

4. Resolve package-version compatibility properly:
   - inspect package versions;
   - use the correct `PostgresSaver` factory or constructor API;
   - pin compatible versions if needed;
   - do not use `any` as a permanent workaround;
   - do not downgrade to `MemorySaver`.

5. The production `createAgent()` function must fail explicitly with a controlled configuration error if `DATABASE_URL` is missing or PostgreSQL cannot be reached.

Example expected behavior:

```text
DATABASE_UNAVAILABLE
LangGraph checkpoint persistence requires PostgreSQL.
```

6. `MemorySaver` may exist only in isolated unit tests, if necessary. It must not be imported or used by:
   - production graph creation;
   - `/app/api/chat/route.ts`;
   - production API code;
   - deployed Docker application.

7. Add an integration test that proves checkpoint persistence:
   - start PostgreSQL;
   - invoke the graph using a fixed `thread_id`;
   - persist state;
   - create a new graph/checkpointer instance;
   - invoke or retrieve the same thread;
   - prove that prior state is restored from PostgreSQL.

==================================================
PHASE 2 — VERIFY AND FIX REAL RAG EMBEDDINGS
==================================================

Inspect `db/seed.ts` and `lib/rag/index.ts`.

The prior implementation used forbidden dummy vectors:

```ts
Array(384).fill(0)
```

Verify this pattern has been removed from every production file.

Required final implementation:

1. Load chunks from `rental_policies.md` only.
2. Generate real embeddings using the configured embedding model, such as:
   ```text
   Xenova/all-MiniLM-L6-v2
   ```
   through `@xenova/transformers`, or another real compatible provider.
3. Normalize embeddings if the chosen cosine-similarity implementation requires normalized vectors.
4. Determine the actual output dimension of the embedding model.
5. Make the pgvector column dimension exactly match the real model output dimension.
6. Store actual embeddings in PostgreSQL.
7. Query real vectors through pgvector cosine distance.
8. Return passages, metadata, and similarity scores.
9. Ensure RAG executes only for:
   ```text
   policy_query
   ```
10. Verify price, availability, eligibility, deposit, discount, mileage, and reservation workflows do not call RAG.

Seed safety requirements:

- Do not delete all operational tables during each seed.
- Use unique keys/source hashes and safe upsert or conflict logic.
- Run seed twice.
- Verify row counts do not duplicate and existing operational data is not erased.

Add tests that prove:

- policy queries retrieve actual passages from pgvector;
- policy answer cites retrieved chunks;
- non-policy intents do not invoke RAG;
- embeddings are not all zero;
- stored vectors have the expected dimension.

==================================================
PHASE 3 — COMPLETE PDF OCR FALLBACK
==================================================

Inspect `lib/ingestor/pdf.ts`.

The production pipeline must perform:

```text
PDF
→ native text extraction first
→ sufficiency assessment
→ if native text is insufficient, render pages as images
→ Tesseract.js OCR
→ return real text and confidence
```

Requirements:

1. Retain native PDF extraction through `pdf-parse` or a compatible Node.js package.
2. Add a clearly defined text sufficiency threshold.
3. Add a real OCR fallback for scanned/image-based PDFs.
4. Use Tesseract.js or a real vision service.
5. Delete all temporary page image files in a `finally` block.
6. Return a structured result with:
   - status;
   - mode: `native_text` or `ocr_fallback`;
   - processing engine;
   - extracted text;
   - confidence;
   - errors;
   - needsHumanReview.
7. Do not create hard-coded OCR text or static confidence values in any production path.
8. Add integration tests for:
   - a text-based PDF;
   - a scanned PDF;
   - a corrupted PDF;
   - an unsupported file.

If no scanned PDF fixture exists, create a legitimate test fixture from a document image in the test fixture folder only, and clearly label it as a scanned-PDF fixture. It must be processed through the real fallback path.

==================================================
PHASE 4 — API SECURITY AND ZERO-TRUST
==================================================

Inspect and repair `/app/api/chat/route.ts`.

Requirements:

1. `intentOverride` must not be accepted from:
   - request JSON;
   - FormData;
   - query parameters;
   - browser client;
   - public API requests.

2. Remove `intentOverride` from the public Zod API schema.

3. If deterministic tests need an intent override:
   - provide it only through an internal test helper;
   - do not export it to public route code;
   - do not allow the frontend to submit it.

4. Reject or ignore a malicious client-supplied `intentOverride` field.
5. Add an automated test proving the public route cannot override the intent.

6. Validate every public request with Zod.
7. Enforce:
   - allowed MIME/file types;
   - safe filename handling;
   - maximum file size;
   - maximum file count;
   - corruption handling.
8. Missing required data must return:
   ```text
   CLARIFICATION_REQUIRED
   ```
   Never fabricate dates, licence values, vehicle IDs, customer IDs, prices, or identity data.
9. Ambiguous dates must trigger clarification.
10. Conflicting information between user text, form data, OCR, PDF, JSON, and TXT must trigger:
    ```text
    needsHumanReview = true
    ```
    with explicit escalation reasons.
11. OCR confidence below 0.85 must trigger human review.
12. Young driver age 21–24 with Premium vehicle must trigger human review.
13. Deposit over 20,000 MAD must trigger human review.
14. Never return raw stack traces, database credentials, LLM errors, or internal implementation details to the client.

==================================================
PHASE 5 — LANGGRAPH.JS NODE AND ROUTING INTEGRITY
==================================================

Inspect and test the production graph.

Verify each of these nodes performs meaningful distinct work:

1. `ingestorNode`
2. `extractorNode`
3. `intentNode` or `intentDetector`
4. `validatorNode`
5. `calculatorNode`
6. `explainerNode`
7. `reporterNode`

Requirements:

- Use real `StateGraph`.
- Use conditional edges.
- Compile the graph.
- Invoke the compiled graph in the production chat API route.
- Track actual execution in `graphTrace`.
- Do not create nodes that only append their own name and return unchanged state.
- Do not run RAG globally before intent classification.

Required routing:

- `policy_query` → RAG retrieval → explainer → reporter; no financial calculation.
- `validate_eligibility` → validation → explainer → reporter; no reservation confirmation.
- `check_availability` → availability → explainer → reporter; no irrelevant price calculation.
- `calculate_total_cost` → validation → deterministic calculator → explainer → reporter.
- `make_reservation` → validation → availability → deterministic price → HITL/booking status → reporter.
- missing data → `CLARIFICATION_REQUIRED`.
- `human_escalation` → review status and escalation reason.
- `out_of_scope` → safe response without invented operational output.

The LLM may only perform:

- structured extraction;
- intent classification;
- natural language explanation.

The LLM must never determine prices, discounts, deposits, eligibility, availability, mileage penalties, booking confirmation, or human-review rules.

==================================================
PHASE 6 — FIX TESTING AND RUN REAL VERIFICATION
==================================================

Keep Vitest and Playwright separate.

Verify that:

- Vitest excludes `tests/e2e/**`.
- Playwright files are only executed by Playwright.
- Unit/integration tests do not mock production behavior when an integration test is required.
- Playwright does not mock `/api/chat`, database, RAG, OCR, or report generation.

Run and report all commands with exact exit code:

```bash
npm ci
npm run lint
npm run typecheck
npm run build
npx vitest run
```

Do not treat a successful build as proof of runtime functionality.

==================================================
PHASE 7 — DOCKER AND FULL RUNTIME VALIDATION
==================================================

Docker Desktop / Docker daemon was previously unavailable.

First run:

```bash
docker version
docker compose version
```

If Docker daemon is unavailable:

1. Do not claim the project is complete.
2. Do not claim the project is ready for submission.
3. Report:
   ```text
   FINAL_STATUS = READY WITH BLOCKERS
   BLOCKER = Docker daemon unavailable
   ```
4. State the exact user action required:
   ```text
   Start Docker Desktop and wait until the Docker daemon is running.
   ```

If Docker daemon is available, execute the complete runtime validation:

```bash
docker compose up -d --build
docker compose ps
docker compose logs --tail=300
npx drizzle-kit push
npm run seed
npm run seed
curl -i http://localhost:3000/api/health
npx vitest run
npx playwright test
```

Then run real SQL validation in PostgreSQL:

```sql
SELECT extname FROM pg_extension WHERE extname = 'vector';

SELECT COUNT(*) FROM fleet_catalog;
SELECT COUNT(*) FROM customer_profiles;
SELECT COUNT(*) FROM booking_logs;
SELECT COUNT(*) FROM seasonal_pricing_matrix;
SELECT COUNT(*) FROM rental_policies_vectors;
```

Verify:

- both Docker services are healthy;
- the health endpoint checks real database connectivity with `SELECT 1`;
- pgvector extension is installed;
- tables exist;
- seed imported data;
- second seed is safe and idempotent;
- vectors are non-zero and correct dimension;
- checkpoint data is stored;
- app can execute agent requests.

==================================================
PHASE 8 — PLAYWRIGHT REAL E2E
==================================================

Run Playwright only when the real application and database are running.

Create or repair tests so they use the real browser UI, real API, real database, real LangGraph graph, real OCR, real RAG, and real report generation.

Do not use mocked network routes, static API results, dummy OCR output, Base64 fake files, or browser fixtures pretending to be production behavior.

Required browser scenarios:

1. Homepage loads.
2. User sends a normal text request and receives a response from the real API.
3. Upload a real identity/licence image; OCR result, confidence, extraction/validation status display.
4. Upload a text PDF; native extraction mode displays.
5. Upload scanned PDF fixture; OCR fallback mode displays.
6. Policy question: retrieved RAG source passages display.
7. Young driver + Premium: human review, escalation reason, +50% deposit, and `PENDING_REVIEW` display.
8. Discount request above 15%: UI displays effective discount capped at 15%.
9. Valid quote/reservation: a genuine non-empty PDF downloads.
10. Malicious client attempt to provide `intentOverride`: request is rejected or ignored.

Run:

```bash
npx playwright test
```

Report:

- exact test count;
- pass/fail count;
- screenshots and traces for failures;
- evidence that no network/API mocking was used.

==================================================
PHASE 9 — FINAL SECURE ZIP
==================================================

Only after all relevant checks are successful, regenerate the ZIP archive.

The ZIP must include:

- project source;
- package.json;
- lockfile;
- Dockerfile;
- docker-compose.yml;
- Drizzle schemas;
- migrations;
- seed script;
- tests;
- Playwright configuration;
- sample data;
- sample files;
- README;
- `.env.example`.

The ZIP must exclude:

- real `.env`;
- any secret;
- node_modules;
- .next;
- logs;
- temp files;
- Docker volumes;
- build artifacts not required for source submission.

Run a ZIP inspection script after generation and report:

```text
ZIP_SECRET_SCAN = PASS
ZIP_ENV_SCAN = PASS
ZIP_NODE_MODULES_SCAN = PASS
ZIP_NEXT_SCAN = PASS
```

Do not include the ZIP in the final delivery if any scan fails.

==================================================
PHASE 10 — NEW REPORT ONLY
==================================================

Create a brand-new file, for example:

```text
FINAL_RUNTIME_VERIFICATION_REPORT.md
```

Do not reuse old audit report text or old findings.

The new report must contain:

1. Current date and current source revision.
2. Files changed.
3. Commands executed with exact exit codes.
4. Lint, typecheck, build, Vitest, Playwright results.
5. Docker status.
6. PostgreSQL and pgvector proof.
7. Migration proof.
8. Seed proof with table row counts before and after second seed.
9. Real embedding proof:
   - model;
   - dimension;
   - sample vector norm;
   - confirmation that vectors are not zero.
10. pgvector RAG retrieval proof.
11. PostgresSaver checkpoint proof.
12. OCR, native PDF, and scanned-PDF fallback proof.
13. Public intentOverride security test result.
14. PDF report generation/download proof.
15. ZIP security scan results.
16. Remaining blockers, if any.
17. Final status using exactly one value:

```text
READY FOR SUBMISSION
READY WITH BLOCKERS
NOT READY
```

FINAL DECISION RULE:

- Use `READY FOR SUBMISSION` only after every static and runtime test passes with real evidence.
- Use `READY WITH BLOCKERS` when Docker or another runtime dependency is unavailable but source-level work is complete.
- Use `NOT READY` when critical defects remain, including secrets, dummy vectors, MemorySaver production fallback, build failure, missing OCR fallback, missing RAG, failed tests, or public intent override.