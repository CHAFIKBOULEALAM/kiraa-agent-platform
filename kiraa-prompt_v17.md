ROLE

You are a senior LangGraph.js Engineer, TypeScript Full-Stack Engineer, and QA Verification Engineer working on the Kiraa Car Rental Platform.

Your last report (PHASE_6_VERIFICATION_REPORT.md) correctly identified that the live application has broken conversational memory and hallucinated entity extraction, and you correctly cancelled deployment. Do not deploy again until every issue below is fixed and proven with literal evidence.

IMPORTANT: In your final summary, do not use language like "completely fulfilled" or "succeeds reliably" unless your own verification report says the same thing. If the report says VERIFIED WITH BLOCKERS, your chat summary must say the same thing, not a more optimistic version.

Do not put business rules or fuzzy vehicle-name matching into the LLM prompt. All deterministic logic stays in TypeScript code, consistent with the project's zero-hallucination architecture. The LLM may only: classify intent using full conversation context, extract raw entity mentions (which are then resolved deterministically), and explain already-validated results.

==================================================
PHASE 1 — FIX CONVERSATIONAL MEMORY (ROOT CAUSE)
==================================================

## 1.1 Verify and fix thread_id continuity end-to-end

1. Inspect `components/ChatUI.tsx` (or wherever chat state lives) and confirm:
   - a `threadId` is generated once per conversation session (not per message);
   - it is stored in browser state (e.g. React state or localStorage) and sent with every subsequent request in the same conversation;
   - it is NOT regenerated on every message.

2. Inspect `app/api/chat/route.ts` and confirm:
   - the incoming `threadId` from the client is used, not a freshly generated one, when one is provided;
   - `graph.invoke()` (or `compiledGraph.invoke()`) is called with:
     ```ts
     { configurable: { thread_id: threadId } }
     ```
   - this happens on every single request, not just the first one.

3. Run this exact reproduction of the screenshot bug against the live or local app, using the SAME threadId for all four messages:
   ```text
   Message 1: "je voudrais une voiture dassi pendant 2 jours"
   Message 2: "Dassia"
   Message 3: "ok c'est voila tarif 5000 dh"
   Message 4: "i have already told you"
   ```
   Paste the full literal JSON response for each message, including the `threadId` sent and the `graphTrace` returned.

4. If the state is not actually persisting (e.g. `missingSlots`, `vehicleName`, `driverAge` are lost between messages), find and fix the exact cause. Common causes to check:
   - the checkpointer is not actually configured with a `thread_id` key on every call;
   - the graph state channels for `params`, `missingSlots`, or `vehicleName` do not use a proper merge reducer and are being overwritten with `undefined` on each new turn;
   - a new `PostgresSaver`/checkpointer instance is created per request instead of reused, losing the connection pool but this alone should not break `thread_id`-based state — investigate the actual root cause and report it precisely.

## 1.2 Fix state reducers

Inspect the state definition (e.g. `lib/schemas/state.ts` or wherever `KiraaState` is defined for the graph).

Ensure:

- `messages` uses an append/merge reducer that preserves prior conversation history, not an overwrite reducer.
- Slot fields (`vehicleName`, `driverAge`, `licenseIssueDate`, `licenseExpiryDate`, `startDate`, `endDate`, `missingSlots`) use a reducer equivalent to:
  ```ts
  (existing, incoming) => incoming ?? existing
  ```
  so a turn that does not mention a field does not erase a previously known value.
- Verify this with a direct test: set `driverAge` in turn 1, omit it entirely from turn 2's input, and confirm it is still present in the state after turn 2.

## 1.3 Fix the continuation rule in intent classification

The `intent_node` must classify intent using the FULL conversation history and current state slots, not just the isolated latest message.

Required rule: if the previous assistant turn was asking for missing details (state has `missingSlots` non-empty, or previous `bookingStatus = MISSING_DETAILS`), and the new user message is short and could plausibly be answering one of those missing slots (a vehicle name, a number, a date, a price, "yes", "voila", etc.), classify it as a CONTINUATION of the existing `make_reservation` (or `validate_eligibility`) flow. Do not reclassify it as `out_of_scope`.

Reserve `out_of_scope` only for messages that are clearly and completely unrelated to vehicle rental (weather, recipes, general trivia) — a rule that should hold even when missingSlots is empty.

Implement this as an explicit check in code (e.g. in `intent.ts` or the router before calling the LLM), not purely as an LLM prompt instruction, since this is a case where the LLM already failed to apply it consistently.

==================================================
PHASE 2 — FIX VEHICLE ENTITY RESOLUTION (KEEP IT DETERMINISTIC)
==================================================

Do not add a hardcoded LLM prompt mapping like "dassi -> Dacia Logan." This was already correctly removed in a prior session in favor of the deterministic `resolveVehicleMention()` function using PostgreSQL `pg_trgm` similarity against the real `fleet_catalog`. Keep using that function.

1. Confirm `resolveVehicleMention()` still exists and is called from the extraction/ingestion path for every raw vehicle mention extracted by the LLM (e.g. "dassi," "Dassia," "voiture dassi").
2. If the LLM extracts a raw string like "dassi," pass that raw string into `resolveVehicleMention()`, not directly into `vehicleName`.
3. If a real match is found (e.g. "Dacia Logan" exists in the catalog with similarity above threshold), store the resolved, verified vehicle name/ID in state and confirm it to the user by its real catalog name.
4. If no match clears the similarity threshold, do not guess — ask the user to clarify or offer to list available models, and do not silently invent a vehicle.
5. Add a guard: if the LLM extracts a `vehicleName` string longer than a reasonable limit (e.g. 60 characters) or containing pricing/spec-like text (digits with units like "km/jour," "ch," "portes"), treat this as a hallucination, discard it, and fall back to asking the user to name the vehicle again. This directly fixes the observed bug where the LLM invented a massive fictional car-spec paragraph as the "vehicleName" for the minor-driver test.

==================================================
PHASE 3 — FIX EXTRACTION HALLUCINATION AND SILENT INTENT CRASHES
==================================================

## 3.1 Fix the minor-driver extraction bug

Reproduce exactly: `age 19, licence issued 1.1 years ago, requesting a rental`.

1. Confirm the LLM extraction step actually receives the age and licence dates in its prompt/context.
2. If the extraction schema or prompt is failing to pull these fields, fix the extraction prompt/schema, not by adding more prose rules, but by verifying the actual JSON schema field names match what the deterministic eligibility function (`verifyDriverEligibility`) expects.
3. Confirm that once `driverAge` and `licenseIssueDate` are present in state, the graph correctly routes to `validator_node` and produces an instant rejection (no human review), matching Scenario 1 of the notebook.

## 3.2 Fix the expired-licence intent crash

Reproduce exactly: `validate_eligibility` request with an expired licence, which previously produced:

```json
{
  "intent": "out_of_scope",
  "errors": [ "Failed to determine intent." ]
}
```

1. Add proper error logging in `intent.ts` (or wherever intent classification happens) so that a genuine failure is logged with the actual underlying error (e.g. Groq API error, malformed JSON, schema validation failure), not silently swallowed into a generic `out_of_scope` fallback.
2. Fix the root cause of the crash. If it is a Zod `strict()` schema mismatch with the Groq structured-output mode (as seen in earlier fixes this session), verify the schema definitions are fully compatible with the current Groq model's structured-output requirements.
3. If intent classification genuinely fails after a fix attempt, the system must return an honest error state (e.g. `INTENT_CLASSIFICATION_FAILED`) with a polite retry message to the user — never silently mislabel a failure as `out_of_scope`, since that produces a false "the assistant refused to help" experience for a system error.

## 3.3 Evaluate model reliability

The current model `qwen/qwen3.8-27b` has caused repeated problems this session: Zod `strict()` schema incompatibility, JSON hallucination, and a hard 1000 OTPM rate limit that broke prior smoke tests.

1. Check what other models are available on the current Groq account/tier that support reliable JSON/structured output and have a higher rate limit (e.g. `llama-3.1-8b-instant` or another currently non-decommissioned Groq model).
2. If a more reliable model is available, test intent classification and extraction against it for the same scenarios, and report a comparison: schema compliance, hallucination rate, and rate-limit headroom.
3. Do not switch models silently — report the comparison and only switch if it demonstrably fixes the failures without violating deterministic business-rule separation.

==================================================
PHASE 4 — FILE-ONLY AND HYBRID INPUT HANDLING
==================================================

1. File-only input (no text): extract driver age, licence issue date, licence expiry date from the document via the existing real OCR/extraction pipeline, store in state, and reply acknowledging receipt while asking for the still-missing rental details (vehicle, dates). Do not fabricate any field not actually present in the document.
2. Text-only input: process normally.
3. Hybrid input (text + file): merge extracted document fields with any details mentioned in the text message, using the merge-preserving reducers from Phase 1.2.
4. Test all three input modes against the real running app and paste literal JSON responses for each.

==================================================
PHASE 5 — BUSINESS RULES REMAIN IN CODE (NOT LLM PROMPT)
==================================================

Confirm and do not regress these existing deterministic rules, enforced only in TypeScript:

- Age < 21 or licence seniority < 2 years → instant rejection, no human review.
- Expired licence → instant rejection.
- Age 21–25 requesting a Premium vehicle → `PENDING_REVIEW`, human review required, deposit ×1.5.
- Discount requests above 15% → capped at 15% by the deterministic pricing function.

Do not implement these as LLM prompt instructions. They must remain pure TypeScript functions, as already built.

==================================================
PHASE 6 — PDF SANITIZATION (ROOT CAUSE, NOT BLIND WRAPPING)
==================================================

Once Phase 3 fixes the upstream extraction bug (Test 10's PDF failure was a downstream symptom of failed age/date extraction, not a PDF bug itself), re-run the PDF generation test for a genuinely rejected-eligibility case and confirm:

1. `pdfReportBase64` is present.
2. Decoded file starts with `%PDF-`.
3. It parses cleanly with a real PDF text-extraction library (avoid relying on unverified `pdf-parse`/`PyPDF2` installs that themselves failed in the last session — confirm the parsing library actually works before trusting its output).
4. No `Command token too long` error occurs.

Do not apply blind character-wrapping regex to all strings; only format specific known long fields (IDs, arrays) with proper line-by-line rendering, as already implemented.

==================================================
PHASE 7 — FULL RE-VERIFICATION WITH LITERAL EVIDENCE
==================================================

Re-run the complete 10-scenario suite from the prior verification report against the fixed code, locally first, then live only if local passes:

1. "je voudrais une voiture dassi" (first message) — confirm the assistant asks for clarification or resolves to a real catalog vehicle, not `out_of_scope`.
2. Follow-up "Dassia" on the SAME thread — confirm this continues the reservation flow using the same state, not a fresh `out_of_scope` classification.
3. Follow-up with dates and price on the SAME thread — confirm state accumulates correctly across all three turns.
4. Minor driver (19, licence 1.1 years) — instant rejection, no human review.
5. Expired licence — instant rejection, no silent `out_of_scope` fallback.
6. Young driver (22) + Premium vehicle — `PENDING_REVIEW`, human review, deposit ×1.5.
7. Discount above 15% — capped at 15%.
8. Pure policy question — `policy_query`, real pgvector RAG passages, no price calculated.
9. Genuinely off-topic message — correctly `out_of_scope`.
10. Valid complete reservation — PDF generated, verified `%PDF-` signature, and parses cleanly.

For every test, paste the literal JSON response, the graph trace, and the `threadId` used. Do not summarize.

==================================================
PHASE 8 — HONEST FINAL REPORT
==================================================

Update `PHASE_6_VERIFICATION_REPORT.md` with literal evidence for all phases above.

Your chat summary to the user must match the report's conclusion exactly. If the report says `VERIFIED WITH BLOCKERS`, do not tell the user "all objectives are completely fulfilled." Use identical wording between the report and your summary.

Use exactly one final status:

```text
VERIFIED — READY FOR DEPLOYMENT
VERIFIED WITH BLOCKERS
NOT VERIFIED
```

Only proceed to redeploy on Railway if the status is `VERIFIED — READY FOR DEPLOYMENT` and all 10 scenarios in Phase 7 pass with literal evidence, including the multi-turn continuity test in scenarios 1–3.



What needs to be added
Insert this as a new phase between Phase 7 and Phase 8 in the prompt I gave you.

text
==================================================
PHASE 7B — FULL PLAYWRIGHT E2E BROWSER MONITORING (MANDATORY, DISTINCT FROM API TESTS)
==================================================

Phase 7's API-level curl/JSON tests are not sufficient proof. You must also run real Playwright browser tests that simulate an actual user typing in the live chat UI, not direct API calls, with full trace and video recording enabled so every step can be visually monitored and audited.

Do not skip this phase or treat Phase 7's API results as equivalent to this phase.

## 1. Configure full monitoring

Run Playwright with complete diagnostic capture:

```bash
npx playwright test --workers=1 --trace on --video on
```

Ensure `playwright.config.ts` has:
- `trace: 'on'`
- `video: 'on'`
- `screenshot: 'on'`

so every test produces a full recording, not just a pass/fail result.

## 2. Multi-turn conversation continuity test (the exact bug from the screenshots)

Write a single Playwright test that reproduces the screenshots step by step, in one continuous browser session (same page, same tab, no reload):

```text
Step 1: Load the chat page.
Step 2: Type "je voudrais une voiture dassi pendant 2 jours" and send.
        Wait for the assistant response to render.
        Assert the response is NOT "Desole, je suis un assistant specialise..." (out_of_scope).
        Assert an INTENT badge other than OUT_OF_SCOPE is shown.
Step 3: Type "Dassia" and send.
        Wait for the response.
        Assert the response continues the SAME reservation flow (references the vehicle or asks a related follow-up), not a fresh out_of_scope rejection.
Step 4: Type "ok c'est voila tarif 5000 dh" and send.
        Wait for the response.
        Assert the conversation still shows continuity, not out_of_scope.
Step 5: Type "i have already told you" and send.
        Assert the assistant does not repeat the generic out_of_scope refusal, and instead references what was actually already provided (e.g. lists which details it still needs).
```

For each step, capture:
- a full-page screenshot;
- the exact rendered assistant message text;
- the exact INTENT badge shown;
- the DOM state of any slot-filling progress indicator.

Save all screenshots and the Playwright trace/video into:

```text
verification_screenshots/multi_turn_continuity/
```

## 3. Full 10-scenario suite as REAL browser interactions, not API calls

Re-implement each of the 10 scenarios from Phase 7 as actual Playwright browser steps (typing into the chat input, clicking upload buttons, waiting for UI updates) rather than direct HTTP requests. This proves the full stack works end-to-end, including the frontend rendering logic, not just the backend API.

For each of the 10 scenarios, capture a screenshot of the final rendered state and confirm:

- the correct status badge color and text are visibly rendered;
- for scenario 10 (valid reservation), the "Download PDF" button is visibly present and clicking it triggers a real, non-empty PDF download (verify via Playwright's `page.waitForEvent('download')` and check the downloaded file's byte signature `%PDF-`).

## 4. Correlate browser actions with backend checkpoint state

For at least the multi-turn continuity test in section 2, after each browser step, independently query the database (via the already-established internal verification route or `railway ssh`) to confirm:

```sql
SELECT COUNT(*) FROM checkpoints WHERE thread_id = '<the actual threadId used by the browser session>';
```

The count must increase after each turn, proving the browser UI, the API route, and PostgresSaver are all using the same `thread_id` consistently — not just that the API responds correctly in isolation.

## 5. Report format

Add a new section to `PHASE_6_VERIFICATION_REPORT.md`:

```text
## PHASE 7B — Playwright E2E Browser Monitoring
```

Include:
- pass/fail count for all Playwright tests;
- confirmation trace/video files exist and their file paths;
- the multi-turn continuity test result with per-step screenshots described (not just "PASS" — describe what was actually visible in each screenshot);
- checkpoint row-count progression across the 4-step multi-turn test;
- confirmation the PDF download test produced a real, valid file.

Do not report this phase as PASS unless the multi-turn continuity test in section 2 shows real continuity in the actual browser UI, matching what was broken in the original screenshots you were given.
Updated instruction to give Antigravity right now
Send this short addendum along with (or appended to) the full enhanced prompt from before:

text
Add Phase 7B to the plan: a mandatory Playwright end-to-end browser test suite with trace and video recording enabled, run distinct from and in addition to the Phase 7 API-level tests. It must reproduce the exact multi-turn conversation from my screenshots ("je voudrais une voiture dassi pendant 2 jours" → "Dassia" → "ok c'est voila tarif 5000 dh" → "i have already told you") inside one continuous browser session, with a screenshot after every step, and must correlate browser-visible state with actual PostgreSQL checkpoint row counts for the same thread_id. Do not consider Phase 7's curl-based tests sufficient proof of the fix. Do not deploy to Railway until Phase 7B passes with full screenshot and trace evidence showing the conversation actually maintains context in the live browser UI.
This closes the gap: API-level JSON tests can pass while the browser still shows broken behavior (different code paths, different state handling, caching, or a frontend bug independent of the backend), so both must be verified separately before you trust a "fixed" claim.