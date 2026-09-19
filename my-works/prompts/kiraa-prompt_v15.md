ROLE

You are an independent QA verification engineer. Do not trust the previous implementation summary or walkthrough.md as proof of correctness. The Phase 6 task tracker explicitly shows the final verification step is unchecked:

```text
- [ ] Verification
  - [ ] Verify scenarios (dassi, age 19, expired, 36 rejected, policy, out of scope)
```

Nothing is confirmed working until this verification actually runs and produces real evidence. Do not claim the project is stable or Railway-ready until every item below is proven.

Do not deploy to GitHub or Railway during this task. This is a local verification and repair task only.

==================================================
STEP 0 — CONFIRM CLEAN BUILD
==================================================

Run and paste the full literal output, not a summary:

```bash
npx tsc --noEmit
npm run build
```

Report the exact exit code for each. Do not say "fixed" without showing the actual final terminal output with zero errors.

==================================================
STEP 1 — VERIFY THE REAL FLEET CATALOG BEFORE TRUSTING FUZZY MATCHING
==================================================

Run this query against the actual local (or Railway, if that's the active target) database:

```sql
SELECT DISTINCT make, model FROM fleet_catalog ORDER BY make;
```

Paste the full literal result.

If "Dacia," "Peugeot," "Renault," or "Volkswagen" do NOT appear in this list, state clearly that the earlier "dassi -> Dacia" example scenario was based on a fictional assumption, and confirm what `resolveVehicleMention()` actually does in that case: it must return no match and prompt the user to clarify or see available vehicles — it must NOT silently invent a vehicle that doesn't exist in the catalog.

==================================================
STEP 2 — VERIFY pg_trgm IS ACTUALLY ENABLED AND FUNCTIONAL
==================================================

Run:

```sql
SELECT extname FROM pg_extension WHERE extname = 'pg_trgm';
```

Paste the literal result. It must show `pg_trgm`.

Then run the actual `resolveVehicleMention()` function (not a hypothetical) with these real inputs and paste the actual returned result for each:

```text
"dassi"
"peugeot 208"
"golf"
"clio"
"a completely made-up nonsense word xyzzyqq"
```

For each, show the similarity score and whether a match was returned or correctly rejected as no-match.

==================================================
STEP 3 — VERIFY THE PDF FIX WITH AN ACTUAL GENERATED FILE
==================================================

Reproduce the exact scenario from the bug report: a 36-year-old whose reservation was rejected, using `make_reservation` intent.

1. Send this request through the real API (locally running app), capture the `pdfReportBase64` from the response.
2. Decode it to an actual file on disk.
3. Run:

```bash
node -e "
const fs = require('fs');
const buf = fs.readFileSync('<decoded-file-path>');
console.log('First bytes:', buf.slice(0,8).toString());
console.log('Size:', buf.length);
"
```

4. Paste the literal output. First bytes must be `%PDF-`.
5. Additionally, parse the PDF with a real Node.js PDF-parsing library (e.g. `pdf-parse`) and confirm it extracts readable text without throwing an error. Paste that extracted text.
6. If any error occurs, show the exact error and do not report this as fixed.

==================================================
STEP 4 — VERIFY EVERY REQUIRED CONVERSATION SCENARIO WITH LITERAL API OUTPUT
==================================================

Run each of these against the real running app and paste the actual JSON response for each, not a description:

1. `"je voudrai une voiture dassi"` — must not return `out_of_scope`. Report the actual intent, actual matched vehicle (or explicit no-match), and actual missing slots if any.
2. A minor driver (age 19, licence 1.1 years) requesting `validate_eligibility` — must be instantly rejected, no human review.
3. An expired licence request — must be instantly rejected with the expiry reason.
4. A 22-year-old requesting a Premium vehicle — must return `PENDING_REVIEW`, `needsHumanReview = true`, and the escalation reason.
5. A discount code above 15% (e.g. `SUMMER20` or `FLASH25`) — must show the effective discount capped at 15%.
6. A pure policy question (e.g. cancellation policy) — must route to `policy_query`, retrieve real RAG passages from PostgreSQL pgvector, and must NOT calculate a price.
7. A genuinely off-topic message (e.g. a cooking question) — must correctly return `out_of_scope`.
8. A message with only a vehicle mention and no dates/age — must return `MISSING_DETAILS` with the correct list of missing slots, and confirm via the graph trace that `validator` and `calculator` nodes were skipped.
9. A follow-up message on the same `threadId` providing the missing dates — confirm the previously provided vehicle mention was retained (not re-asked for), proving real multi-turn slot persistence via PostgresSaver.

For each test, paste:
- the exact request sent;
- the exact JSON response received;
- the graph trace;
- confirmation of which nodes ran or were skipped.

==================================================
STEP 5 — VERIFY THE 429 GRACEFUL FALLBACK ACTUALLY WORKS
==================================================

If the Groq quota is currently exhausted, use that real state to test. If not, either wait for a real 429 or use a deliberately invalid/throttled test key in a non-production test run to force a 429 response from Groq, and confirm:

1. The application does not crash or hang.
2. The user receives a clear, honest message that the assistant is temporarily unavailable.
3. No stack trace, internal error, or secret is exposed to the client.

Paste the actual response body and HTTP status code observed.

==================================================
STEP 6 — VERIFY THE FRONTEND WITH AN ACTUAL SCREENSHOT OR DOM SNAPSHOT
==================================================

Run the app locally, open the browser, and for the `MISSING_DETAILS` and `PENDING_REVIEW` cases, capture and describe the actual rendered UI state, including which badges and which suggestion chips actually appear. Do not describe intended behavior — describe what is actually rendered.

==================================================
FINAL REPORT
==================================================

Update the Phase 6 task tracker to check off the verification item only if all steps above produce real passing evidence.

Create:

```text
PHASE_6_VERIFICATION_REPORT.md
```

It must contain literal command outputs and literal JSON responses for every step above, not prose summaries.

Use exactly one final status:

```text
VERIFIED — READY FOR DEPLOYMENT
VERIFIED WITH BLOCKERS
NOT VERIFIED
```

Do not use "VERIFIED — READY FOR DEPLOYMENT" unless every one of the 9 scenarios in Step 4, the PDF check in Step 3, the fleet catalog check in Step 1, and the pg_trgm check in Step 2 are proven with literal evidence, not descriptions of intended behavior.