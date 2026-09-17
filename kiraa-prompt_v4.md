ROLE

You are a senior Full-Stack TypeScript Engineer, LangGraph.js Agentic AI Engineer, PostgreSQL/pgvector Engineer, QA Engineer, DevOps Engineer, and Security Engineer.

Fix the Kiraa JavaScript/TypeScript project located at:

notebook-tutorial/Kiraa-project

This is an implementation task, not a read-only audit. Apply the fixes below directly in the project, but do not refactor the project into separate frontend/backend folders. Keep the existing unified Next.js App Router architecture because the previous audit concluded:

```text
NO REFACTOR REQUIRED BEFORE SUBMISSION
```

The project must comply with:

1. notebook-tutorial/Kiraa-project/Kiraa_JS_Conversion_Prompt.md
2. Kiraa_Cahier_des_Charges_updated-javascript.pdf
3. kiraa_tutorial_executed.ipynb, which remains the source of truth for deterministic business rules, financial constants, E2E scenarios, and zero-hallucination separation.

IMPORTANT:

- Do not weaken, delete, skip, mock, fake, or bypass tests in order to get a PASS result.
- Do not replace real OCR, real embeddings, real pgvector retrieval, real PostgreSQL checkpointing, or real browser testing with placeholders.
- Do not add Python.
- Do not change the deterministic TypeScript business rules unless fixing a verified mismatch with the notebook.
- Do not create a separate frontend/backend structure at this stage.
- Keep all code under `notebook-tutorial/Kiraa-project`.
- Do not include a real `.env` file in any ZIP archive.
- Do not print, log, commit, or expose API keys, passwords, or secrets.

==================================================
PHASE 0 — MANDATORY SECURITY ACTIONS
==================================================

The previous ZIP archive exposed a real Groq API key in:

```text
notebook-tutorial/Kiraa-project/.env
notebook-tutorial/New folder/.env
```

Do not attempt to use, display, copy, validate, or preserve the old exposed key.

1. Confirm that `.env` is ignored by Git and Docker.
2. Ensure `.env.example` contains placeholders only, never real credentials.
3. Update any archive-generation script so it excludes:
   - `.env`
   - any file named `.env`
   - `.env.local`
   - `.env.production`
   - `.env.development`
   - all secrets files
   - `node_modules`
   - `.next`
   - database volumes
   - generated local OCR artifacts
4. Keep `.env.example` included in the archive.
5. Search the full repository for Groq key patterns such as:
   ```text
   gsk_
   GROQ_API_KEY=
   DATABASE_URL=postgresql://
   ```
   Do not print the secret value in output. Report only file path and whether a secret pattern was found.
6. If a real `.env` exists locally, leave it usable for local execution but ensure it is never added to the submission archive.
7. Add a pre-submission security check script that fails if the ZIP contains `.env`, secrets, `node_modules`, or `.next`.

Do not regenerate the ZIP until all other fixes and verification steps pass.

==================================================
PHASE 1 — FIX TYPESCRIPT, LINT, BUILD, AND TEST CONFIGURATION
==================================================

Fix every TypeScript compilation error found in the audit.

### 1.1 Fix duplicate MemorySaver import

In `lib/agent/graph.ts`:

- Remove all duplicate `MemorySaver` imports.
- Do not retain `MemorySaver` as the production checkpointer after PostgreSQL checkpointing is fixed.
- The final production graph must use PostgreSQL checkpoint persistence.

### 1.2 Fix public intentOverride bypass

`intentOverride` must never be accepted from public user input, `FormData`, client JSON, query parameters, or the browser.

In `app/api/chat/route.ts`:

- Remove parsing of `intentOverride` from public input.
- Remove it from the public API schema.
- Ensure the route always calls the production intent classification path.
- If `intentOverride` is needed for deterministic tests, it may only be injected directly by test code into an internal graph invocation helper that is not exported as a public API route.
- Add a test proving that a client-supplied `intentOverride` field is rejected or ignored.

### 1.3 Fix route TypeScript mismatch

Fix the error where `string | null` is assigned to an intent type. Use strict Zod validation and a proper typed internal intent value.

Do not use unsafe casts merely to silence TypeScript.

### 1.4 Fix ReactMarkdown TypeScript error

In `components/ChatUI.tsx`:

- Do not pass `className` directly to `ReactMarkdown` if its installed type does not support it.
- Wrap it in a styled container:

```tsx
<div className="prose prose-invert max-w-none">
  <ReactMarkdown>{message.content}</ReactMarkdown>
</div>
```

Preserve accessibility and safe rendering.

### 1.5 Separate Vitest and Playwright

Ensure that Vitest does not load Playwright files.

Create or update `vitest.config.ts` so it includes only unit/integration tests and excludes browser E2E tests, for example:

```ts
test: {
  include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
  exclude: ["tests/e2e/**", "node_modules/**", ".next/**"],
}
```

Keep Playwright tests under:

```text
tests/e2e/
```

and configure Playwright separately through `playwright.config.ts`.

### 1.6 Required validation commands

After fixes, run:

```bash
npm ci
npm run lint
npm run typecheck
npm run build
npx vitest run
```

Do not claim this phase is complete unless all commands exit with code 0.

==================================================
PHASE 2 — FIX REAL PGVECTOR EMBEDDINGS AND RAG
==================================================

The current seed script reportedly uses an invalid placeholder:

```ts
Array(384).fill(0)
```

This is forbidden. Remove every dummy embedding, static vector, fake cosine score, and fallback fake RAG answer from production code.

### 2.1 Real embedding implementation

In `db/seed.ts` and `lib/rag/index.ts`:

1. Use a real embedding provider.
2. Prefer the already proposed local option:

```ts
@xenova/transformers
Xenova/all-MiniLM-L6-v2
```

or another real configurable embedding provider compatible with pgvector.

3. Generate actual normalized embeddings for each chunk of `rental_policies.md`.
4. Store the actual numeric embedding array in the pgvector column.
5. Do not use:
   - zero arrays;
   - repeated constants;
   - random vectors;
   - fake similarity values;
   - keyword-only retrieval disguised as vector search;
   - static answer text.

### 2.2 Validate vector dimension

Determine the actual embedding dimension returned by the chosen model.

Make the pgvector schema dimension match that model exactly.

Document in README:

- embedding provider/model;
- vector dimension;
- normalization approach;
- cosine similarity strategy;
- seed process.

### 2.3 RAG retrieval

`lib/rag/index.ts` must:

- exist;
- be imported and used by the production LangGraph graph;
- query PostgreSQL using pgvector cosine similarity;
- return retrieved chunks, metadata, and scores;
- use only `rental_policies.md` as the policy corpus;
- run only when the classified intent is `policy_query`.

Do not call RAG for:

- price calculation;
- availability;
- eligibility;
- deposit;
- discount;
- mileage;
- reservation confirmation.

Add tests proving:

1. `policy_query` invokes RAG and returns retrieved passages.
2. `calculate_total_cost` does not invoke RAG.
3. `validate_eligibility` does not invoke RAG.
4. Retrieved RAG content originates from the seeded `rental_policies.md` chunks.

### 2.4 Safe and idempotent seed

The seed script must not delete all production tables on every run.

Replace destructive full-table deletion with an idempotent strategy such as:

- unique keys;
- `onConflictDoNothing`;
- `onConflictDoUpdate` only when explicitly safe;
- versioned corpus/source hashes for policy chunks;
- transactional seed execution.

The second seed run must not create duplicates and must not erase unrelated operational data.

==================================================
PHASE 3 — RESTORE REAL POSTGRESQL LANGGRAPH CHECKPOINTING
==================================================

The production graph must not use `MemorySaver`.

Use `@langchain/langgraph-checkpoint-postgres` with a real PostgreSQL connection sourced from `DATABASE_URL`.

Requirements:

1. Resolve package/version compatibility correctly; do not downgrade to `MemorySaver` as a workaround.
2. Use the documented `PostgresSaver` API for the installed package version, such as a supported `fromConnString` or pool-based factory.
3. Initialize required checkpoint tables according to the package documentation.
4. Compile the production `StateGraph` using the PostgreSQL checkpointer.
5. Use a stable `thread_id` / session identifier from server-controlled request context.
6. Do not accept arbitrary privileged state from the browser.
7. Add an integration test that:
   - runs a graph request using a thread ID;
   - persists the checkpoint;
   - creates a fresh graph/checkpointer instance;
   - retrieves or continues the same thread;
   - proves state continuity through PostgreSQL.

`MemorySaver` may exist only in isolated unit tests. It must not be used by the production graph or production API route.

==================================================
PHASE 4 — COMPLETE REAL PDF OCR FALLBACK
==================================================

Inspect `lib/ingestor/pdf.ts`.

The required behavior is:

```text
PDF upload
→ native text extraction first
→ text sufficiency check
→ if insufficient, render PDF pages to images
→ real Tesseract.js OCR
→ return extracted text, confidence, errors, and human-review state
```

Requirements:

1. Keep real native extraction using `pdf-parse` or another Node-compatible parser.
2. Define and document a meaningful text-sufficiency threshold.
3. Implement a real scanned-PDF/image-PDF fallback path.
4. Use Tesseract.js or a real configured vision provider on rendered PDF pages.
5. Clean up temporary page image files safely, including when an exception occurs.
6. Do not return static OCR text, fake confidence values, or a false successful extraction.
7. Return structured result fields:
   - validation status;
   - processing engine;
   - native/OCR mode;
   - extracted text;
   - confidence;
   - errors;
   - needsHumanReview.
8. Add tests for:
   - text PDF → native extraction;
   - scanned PDF → fallback OCR;
   - invalid PDF → explicit failure;
   - no OCR engine → honest blocked/failure status.

==================================================
PHASE 5 — FIX API ROUTING, ZERO-TRUST, AND STATE INTEGRITY
==================================================

Ensure `app/api/chat/route.ts`:

1. Validates all public input with Zod.
2. Supports multi-file uploads safely.
3. Enforces allowed file types:
   - JPG/JPEG/PNG;
   - PDF;
   - JSON;
   - TXT.
4. Enforces a documented upload-size limit.
5. Rejects unsupported or corrupted files.
6. Routes missing required fields to:

```text
CLARIFICATION_REQUIRED
```

7. Does not invent birth dates, licence dates, vehicle IDs, customer identities, prices, or other business values.
8. Detects data conflicts between user form input, OCR extraction, JSON/TXT/PDF content, and user message.
9. Sets:

```text
needsHumanReview = true
```

with explicit escalation reasons when conflicts exist.
10. Requires human review when:
    - OCR confidence < 0.85;
    - driver is 21–24 and vehicle category is Premium;
    - deposit exceeds 20,000 MAD;
    - extracted/form/message data conflicts.
11. Invokes the real compiled LangGraph graph.
12. Never exposes internal API keys, connection strings, database errors, stack traces, or checkpointer details to the browser.

==================================================
PHASE 6 — VERIFY ALL SEVEN LANGGRAPH NODES
==================================================

Keep the unified Next.js architecture but verify and repair the internal agent graph.

The production graph must contain seven meaningful nodes:

1. `ingestorNode`
2. `extractorNode`
3. `intentNode`
4. `validatorNode`
5. `calculatorNode`
6. `explainerNode`
7. `reporterNode`

Requirements:

- Every node must perform its intended responsibility, not merely append its name to `graphTrace`.
- The graph must use real `StateGraph`, conditional edges, compilation, and invocation.
- The graph must store an actual `graphTrace`.
- The API route must invoke this graph, not a duplicate manual orchestration flow.
- `policy_query` must retrieve RAG passages and must not calculate price.
- `validate_eligibility` must not confirm a reservation.
- `check_availability` must not perform irrelevant pricing.
- `calculate_total_cost` must validate required data before deterministic calculation.
- `make_reservation` must validate eligibility, check availability, calculate the price, apply HITL rules, and only then set reservation state.
- `human_escalation` must record escalation reason and block inappropriate automatic confirmation.
- `out_of_scope` must return a safe response.
- The LLM may classify intent, extract fields, and explain validated results only.
- The LLM must never calculate price, decide eligibility, decide availability, determine deposit, cap discount, calculate mileage, or confirm a reservation.

Add integration tests that execute the actual compiled graph and assert graph traces, state fields, and deterministic outcomes.

==================================================
PHASE 7 — REPORTER AND REAL DOWNLOAD
==================================================

The Reporter must use `pdfkit` or another real Node library to generate a genuine PDF/DOCX file.

Requirements:

1. Do not use `pdfBytesMock`, placeholder bytes, or static Base64.
2. Generate a report only from validated deterministic state and real RAG passages where applicable.
3. Include relevant safe fields:
   - customer/document summary;
   - requested vehicle;
   - eligibility;
   - pricing;
   - deposit;
   - discount;
   - human-review status;
   - booking status;
   - policy sources when applicable.
4. The report must not claim confirmation for a rejected or pending-human-review booking.
5. The returned document must have non-zero length and a valid file signature.
6. Add a test verifying actual PDF generation and non-empty content.
7. Ensure the frontend download button appears only when a valid generated report exists.

==================================================
PHASE 8 — PLAYWRIGHT REAL E2E TESTING
==================================================

Keep Playwright separate from Vitest.

The tests must run against the real application and must not mock `/api/chat`, the LangGraph graph, PostgreSQL, RAG, OCR, or PDF generation.

Set up Playwright so it starts or connects to a real Next.js server with real Docker/PostgreSQL services available.

Create/repair browser E2E tests for:

1. Home page loads and chat UI is usable.
2. Normal text request reaches the real API and returns an actual response.
3. Real image upload triggers real OCR and displays:
   - validation status;
   - OCR engine;
   - confidence;
   - extracted content;
   - structured fields or clarification error.
4. Text PDF upload shows native text extraction mode.
5. Scanned PDF upload exercises OCR fallback if a valid scanned PDF fixture is available.
6. Policy query returns PostgreSQL pgvector RAG sources in the UI.
7. Young driver + Premium scenario shows:
   - human review;
   - escalation reason;
   - 50% deposit increase;
   - booking status `PENDING_REVIEW`, not confirmed.
8. Discount greater than 15% shows the effective 15% cap.
9. Generated PDF report downloads as a real, non-empty file.
10. Public attempt to send `intentOverride` is rejected or ignored.

Use real sample files in the project. Do not use Base64 mock image data, fake browser response objects, mocked network routes, or static test-only outputs.

Run:

```bash
npx playwright test
```

Capture exact pass/fail counts and preserve traces/screenshots for failures.

==================================================
PHASE 9 — DOCKER RUNTIME VERIFICATION
==================================================

Do not claim final completion until Docker Desktop / Docker daemon is available.

If Docker is not running:

1. Report that runtime verification is BLOCKED.
2. Do not call the project READY FOR SUBMISSION.
3. Provide exact steps needed from the user:
   - start Docker Desktop;
   - wait until the daemon is running;
   - rerun the verification commands.

When Docker is available, execute:

```bash
docker compose up -d --build
docker compose ps
docker compose logs --tail=250
npx drizzle-kit push
npm run seed
npm run seed
curl -i http://localhost:3000/api/health
npx vitest run
npx playwright test
```

Then run SQL checks inside PostgreSQL and report actual table counts:

```sql
SELECT extname FROM pg_extension WHERE extname = 'vector';
SELECT COUNT(*) FROM fleet_catalog;
SELECT COUNT(*) FROM customer_profiles;
SELECT COUNT(*) FROM booking_logs;
SELECT COUNT(*) FROM seasonal_pricing_matrix;
SELECT COUNT(*) FROM rental_policies_vectors;
```

Run the seed twice and show counts before and after the second execution.

==================================================
PHASE 10 — README, READINESS REPORT, AND ZIP
==================================================

Update README.md only after the implementation and runtime checks are complete.

README must document:

- prerequisites;
- Node version;
- Docker Compose local setup;
- environment variables;
- `.env.example`;
- migrations;
- idempotent seed;
- app URL;
- health endpoint;
- test commands;
- OCR dependencies;
- RAG embedding model, dimension, and cosine similarity;
- LangGraph PostgreSQL checkpoint persistence;
- upload limits;
- security guidance;
- remote HTTPS deployment;
- logging and monitoring;
- rollback/archive/delete procedure;
- 5-minute functional demo.

Create a readiness report based only on actual results.

The report must clearly distinguish:

```text
PASS
FAIL
NOT RUN
BLOCKED
```

Do not claim `READY FOR SUBMISSION` when Docker, database, seed, pgvector RAG, checkpoint persistence, or Playwright testing is not actually verified.

Only regenerate the submission ZIP when all of the following are proven:

```text
npm run lint = PASS
npm run typecheck = PASS
npm run build = PASS
npx vitest run = PASS
npx playwright test = PASS
Docker Compose services = healthy
pgvector extension = verified
Drizzle migrations = verified
seed = verified and idempotent
real embeddings = verified
real pgvector retrieval = verified
PostgresSaver checkpoint persistence = verified
real OCR/PDF pipeline = verified
PDF/DOCX generation = verified
no .env or secrets in ZIP = verified
```

The ZIP must exclude:

```text
.env
.env.local
.env.production
.env.development
node_modules
.next
database volumes
temporary OCR files
logs containing secrets
```

The ZIP must include:

```text
.env.example
README.md
Dockerfile
docker-compose.yml
source code
migrations
seed scripts
tests
Playwright configuration
sample test files
required datasets
```

==================================================
FINAL RESPONSE FORMAT
==================================================

After completing the work, provide:

1. Files changed and why.
2. Exact commands executed and exit codes.
3. Results for lint, typecheck, build, Vitest, and Playwright.
4. Docker, PostgreSQL, pgvector, migration, and seed evidence.
5. Row counts for all required tables before and after the second seed.
6. Proof that stored RAG embeddings are real, non-zero, normalized vectors.
7. Proof that RAG retrieves actual passages from `rental_policies.md` through pgvector cosine similarity.
8. Proof that `PostgresSaver` persists and restores a graph checkpoint.
9. Proof of real OCR, native PDF extraction, and scanned-PDF fallback.
10. Proof that public `intentOverride` bypass is removed.
11. PDF report generation evidence.
12. Security/ZIP verification confirming no real `.env` or secret is included.
13. A final readiness status using exactly one of:
    - READY FOR SUBMISSION
    - READY WITH BLOCKERS
    - NOT READY

Do not use READY FOR SUBMISSION unless all runtime checks above pass with actual evidence.