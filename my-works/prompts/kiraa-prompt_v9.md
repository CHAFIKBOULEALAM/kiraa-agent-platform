ROLE

You are an independent, skeptical senior Full-Stack TypeScript Engineer, Agentic AI Architect, QA/Playwright Specialist, PostgreSQL/pgvector Engineer, and Security Reviewer.

Do not trust the previous completion claim. The prior report contains contradictions and suspicious language that suggest test-mode bypassing of OCR and RAG. Perform an independent, evidence-only re-verification of:

notebook-tutorial/Kiraa-project

Two conflicting final reports exist. One claims "10/10 tests passed, fully ready." The other says "Phase B: Playwright <WAITING FOR RESULTS>" and "OVERALL STATUS: NOT READY." Explain this contradiction first, with exact file timestamps and content, before doing anything else.

==================================================
RULE: NO BYPASSING UNDER E2E_TEST_MODE
==================================================

`E2E_TEST_MODE=true` may ONLY replace the LLM-based intent classification step. It must NEVER bypass, short-circuit, skip, or fake:

- real Tesseract.js OCR execution on uploaded images;
- real native PDF text extraction;
- real OCR fallback for scanned/image-based PDFs;
- real pgvector cosine-similarity RAG retrieval against PostgreSQL;
- real PostgresSaver checkpoint read/write;
- real deterministic TypeScript business calculations (eligibility, availability, price, deposit, discount, mileage);
- real Zod validation;
- real PDF/DOCX report generation.

If you find any code path where E2E_TEST_MODE causes any of the above to be skipped, short-circuited, or replaced with a static/fake value, this is a CRITICAL FAILURE. Fix it so that only intent classification is affected. All other components must execute for real, even during Playwright tests.

Search explicitly for and report every instance of:

```text
short-circuit
short circuit
bypass
skip
E2E_TEST_MODE
mockOcr
staticOcr
fakeRag
context bypass
```

For every match, show the exact code, explain what it actually does at runtime, and state whether it violates the rule above.

==================================================
STEP 1 — RECONCILE THE CONTRADICTORY REPORTS
==================================================

1. Show the full content and last-modified timestamp of every FINAL_RUNTIME_VERIFICATION_REPORT.md version currently present in the project or in scratch/brain folders.
2. Identify which one, if any, reflects the actual last real Playwright execution.
3. Delete or clearly archive the stale/incorrect one. Keep exactly one authoritative report going forward.
4. State explicitly: was the "10/10 passed" report generated from an actual completed Playwright run, or written before the run finished? Show the actual Playwright JSON/HTML report file timestamp as proof.

==================================================
STEP 2 — REMOVE THE FABRICATED FLASH50 CODE
==================================================

`FLASH50` is not a real discount code from the original notebook. It was invented purely to satisfy a previously fabricated test string.

1. Remove `FLASH50` from `lib/engine/constants.ts` unless it is a genuinely intended business feature explicitly present in the notebook or cahier des charges.
2. Rewrite the T8 discount-cap test to use one of the real notebook-defined codes:
   ```text
   SUMMER20 (20% nominal, capped at 15%)
   FLASH25 (25% nominal, capped at 15%)
   ```
3. Re-run T8 using the real code and real seeded vehicle/customer IDs, and show the actual computed price, actual discount amount, and actual capped percentage in the API response.

Do not invent business rules to satisfy tests. Tests must reflect real business rules, not the reverse.

==================================================
STEP 3 — PROVE REAL OCR EXECUTION (NOT SHORT-CIRCUITED)
==================================================

For T3 (image OCR) and T5 (scanned PDF), disable any test-mode OCR shortcut if one exists.

Run this scenario for real:

1. Upload the actual JPG sample through the real browser UI.
2. Confirm Tesseract.js actually executes (show worker creation, processing time, actual raw OCR text returned).
3. Confirm the raw OCR text is passed into the real structured-extraction step.
4. Show the exact OCR text string returned, the confidence score, and the final structured JSON.

For the scanned PDF:

1. Confirm `tests/fixtures/scanned_identity_document.pdf` is genuinely image-based (run native extraction first and show it returns near-zero usable text).
2. Confirm the real OCR fallback path executes: page rendered to image, Tesseract invoked, temporary files deleted.
3. Show the actual mode returned (`ocr_fallback`), actual OCR engine, actual extracted text, actual confidence.

If OCR was previously short-circuited under E2E_TEST_MODE, fix the implementation so it runs for real even during Playwright tests, then re-run T3 and T5 and show the real output.

==================================================
STEP 4 — PROVE REAL RAG RETRIEVAL (NOT BYPASSED)
==================================================

For T6 (policy question), disable any "context bypass" behavior if one exists.

Run this for real:

1. Ask the real policy question through the browser.
2. Confirm the graph classifies intent as `policy_query` (this classification step may use E2E_TEST_MODE).
3. Confirm the RAG node performs an actual pgvector cosine-similarity SQL query against `rental_policies_vectors`.
4. Show the actual SQL executed, the actual retrieved passage text, and the actual similarity score.
5. Confirm no price calculation occurred.

If RAG was previously bypassed with a static/fake context under test mode, fix it so retrieval always executes for real, then re-run T6 and show the real retrieved passage.

==================================================
STEP 5 — PROVE REAL POSTGRESQL CHECKPOINT PERSISTENCE
==================================================

Run an isolated verification:

1. Invoke the real compiled graph with a fixed `thread_id`.
2. Query `SELECT COUNT(*) FROM checkpoints WHERE thread_id = '<id>'` before and after.
3. Create a second, independent process/script execution.
4. Resume the same `thread_id` and prove state is recovered from PostgreSQL, not recreated.
5. Report exact row counts before and after both invocations.

==================================================
STEP 6 — COMPLETE THE MISSING PHASE 7 (PRODUCTION PATH REVALIDATION)
==================================================

The task tracker shows Phase 7 was never completed. Complete it now.

With `E2E_TEST_MODE` NOT SET (production mode, real LLM), run real curl requests against the live application for each of these scenarios and show the full JSON response:

1. Normal message.
2. Underage driver (should be rejected, no price calculated).
3. Expired licence (should be rejected).
4. Young driver + Premium vehicle using real seeded IDs (should show `needsHumanReview=true`, `PENDING_REVIEW`, deposit ×1.5).
5. Valid discount request using `SUMMER20` or `FLASH25` (should show 15% cap).
6. Policy question (should show real RAG passages, no price).
7. Missing required field (should show `CLARIFICATION_REQUIRED`).
8. Public request attempting `intentOverride=make_reservation` (should be ignored).

Report the exact HTTP status and JSON body for each, with API keys/secrets redacted.

If the Groq daily quota is exhausted during this step, wait or use a different valid API key, but do not skip this verification — it is the only proof that the real (non-test-mode) system works.

==================================================
STEP 7 — RE-RUN THE FULL TEST SUITE HONESTLY
==================================================

After steps 2–6 are fixed, rerun everything from a clean state:

```bash
docker compose down -v
docker compose up -d --build
docker compose ps
npm run db:migrate
npm run db:seed
npm run db:seed
npm run lint
npm run typecheck
npm run build
npx vitest run
npx playwright test --workers=1
```

Report every exact exit code and the actual Playwright HTML/JSON report path and timestamp.

Do not report "PASS" for any command without showing its literal terminal output tail.

==================================================
STEP 8 — FINAL HONEST REPORT
==================================================

Create exactly one new file:

```text
FINAL_RUNTIME_VERIFICATION_REPORT_v2.md
```

Delete or clearly mark the previous conflicting reports as superseded.

It must contain, with literal command output excerpts, not summaries:

1. Reconciliation explanation of the two prior contradictory reports.
2. Confirmation that E2E_TEST_MODE affects only intent classification, with grep evidence.
3. Real OCR text extracted from the actual JPG sample.
4. Real scanned-PDF OCR fallback text and mode.
5. Real RAG passage retrieved for the policy question, with SQL and similarity score.
6. Real discount calculation using SUMMER20 or FLASH25 (not FLASH50).
7. Real PostgresSaver checkpoint count before/after, across two separate invocations.
8. Real production-mode (non-test-mode) curl results for all 8 scenarios in Step 6.
9. Exact Playwright pass/fail count with report file path and timestamp.
10. Exact lint, typecheck, build, and Vitest output tails.
11. ZIP security scan results, including explicit confirmation that Markdown files are scanned and that no real `.env`, secret, or credential exists anywhere in the archive.
12. A section titled "Known Limitations" listing anything not fully verified.
13. Final status using exactly one value:

```text
READY FOR SUBMISSION
READY WITH BLOCKERS
NOT READY
```

Use `READY FOR SUBMISSION` only if every item above has literal, non-summarized evidence. If OCR, RAG, or checkpoint persistence was ever short-circuited or bypassed and cannot be proven fixed with real output, the status must be `NOT READY`.

Do not regenerate or present any submission ZIP as final until FINAL_RUNTIME_VERIFICATION_REPORT_v2.md shows READY FOR SUBMISSION with full literal evidence.