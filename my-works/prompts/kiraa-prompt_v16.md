ROLE

You are a senior DevOps, LangGraph.js, and Frontend QA Engineer working on the Kiraa project at:

notebook-tutorial/Kiraa-project

Your previous conclusion that database verification is "physically impossible" locally is incorrect. This exact constraint was already solved earlier in this project using two proven methods. Use them now instead of declaring the task blocked.

Method A — Already configured SSH access:
An SSH key was already generated and registered with:
```bash
railway ssh keys add
```
This enables:
```bash
railway ssh <command>
```
which executes commands INSIDE the Railway container with real access to `postgres.railway.internal`, unlike `railway run`, which only injects environment variables locally.

Method B — Already built internal verification route:
The authenticated route `/api/internal/verify-db` was already implemented and proven to work in a prior session (see RAILWAY_DEPLOYMENT_REPORT.md), executing migrations, seed, and pgvector checks from inside the deployed application via a simple `curl` call with the `X-Internal-Verification-Key` header.

Use whichever of these two methods actually works with the current project state. Do not declare verification impossible again without first trying both.

==================================================
PHASE 0 — FIX THE LOCAL BUILD LOCK (EPERM on .next)
==================================================

The build failed with:

```text
EPERM on .next (OneDrive file lock)
```

Fix this properly:

1. Stop any running Node/Next.js processes:
```powershell
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
```

2. Pause OneDrive sync temporarily, or add `.next`, `node_modules`, and `test-results` to OneDrive's "exclude from sync" list for this folder if such a setting is available. If not available, move forward with retries after closing any file explorer windows open on this folder.

3. Delete `.next` cleanly:
```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
```

4. Retry the build:
```bash
npm run build
```

5. If it still fails with EPERM, wait 5 seconds and retry up to 3 times, since OneDrive file locks are often transient.

Report the final literal exit code and output tail. Do not proceed until `npm run build` succeeds with exit code 0.

==================================================
PHASE 1 — VERIFY DATABASE USING railway ssh (PREFERRED)
==================================================

Try this first:

```bash
railway ssh "npx tsx scratch_db.ts"
railway ssh "npx tsx scratch_db_resolution.ts"
railway ssh "npx tsx scratch_pdf_test.ts"
railway ssh "npx tsx scratch_api_tests.ts"
```

If `railway ssh` requires a specific service to be selected, inspect and use:

```bash
railway ssh --help
railway service list
```

and target the correct application service explicitly if needed.

If `railway ssh` works, paste the full literal output of each script. Do not summarize.

==================================================
PHASE 2 — IF SSH FAILS, USE THE INTERNAL VERIFY ROUTE (FALLBACK)
==================================================

If `railway ssh` genuinely cannot execute these scripts, deploy the current code (only if Phase 0 build succeeded) and use the previously proven internal route pattern:

1. Extend or reuse `/api/internal/verify-db` (protected by `INTERNAL_VERIFICATION_KEY`) to also support running the specific verification checks needed:
   - real fleet catalog makes/models query;
   - `pg_trgm` extension check;
   - `resolveVehicleMention()` test calls for "dassi", "peugeot 208", "golf", "clio", and a nonsense string;
   - a real PDF generation test for the rejected-eligibility scenario, returning the PDF byte length and first bytes.

2. Deploy:
```bash
railway up
```

3. Call the route with curl and paste the full literal JSON response for each check. Never print `DATABASE_URL`, `GROQ_API_KEY`, or `INTERNAL_VERIFICATION_KEY` values.

4. After verification is complete, remove or properly restrict this diagnostic route so it is not left permanently exposed in production without protection.

==================================================
PHASE 3 — RUN THE FULL SCENARIO SUITE AGAINST THE LIVE APP
==================================================

Using the already-deployed Railway URL, send these real requests via curl and paste the full literal JSON response for each:

1. `"je voudrai une voiture dassi"` — confirm intent is NOT `out_of_scope`; report actual matched vehicle or explicit no-match plus missing slots.
2. Minor driver (age 19, licence 1.1 years), `validate_eligibility` — confirm instant rejection, no human review.
3. Expired licence — confirm instant rejection with expiry reason.
4. 22-year-old requesting a Premium vehicle — confirm `PENDING_REVIEW`, `needsHumanReview = true`, escalation reason.
5. Discount code above 15% (`SUMMER20` or `FLASH25`) — confirm effective discount capped at 15%.
6. Pure policy question — confirm `policy_query`, real pgvector RAG passages, no price calculated.
7. Genuinely off-topic message — confirm `out_of_scope`.
8. Vehicle mention only, no dates/age — confirm `MISSING_DETAILS`, correct missing-slot list, and graph trace showing `validator`/`calculator` were skipped.
9. Follow-up message on the same `threadId` providing missing dates — confirm the previously mentioned vehicle was retained, not re-asked for.
10. A rejected-eligibility PDF (age 36 scenario) — decode the returned `pdfReportBase64`, save to disk, and verify:
```bash
node -e "
const fs = require('fs');
const buf = fs.readFileSync('<decoded-path>');
console.log('First bytes:', buf.slice(0,8).toString());
console.log('Size:', buf.length);
"
```
First bytes must be `%PDF-`. Also parse it with a real PDF text-extraction library and paste the extracted text.

==================================================
PHASE 4 — VISUALLY VERIFY THE FRONTEND IS PROFESSIONALLY RESTYLED
==================================================

This has not yet been checked in any session. Do it now.

1. Run the app locally (after the Phase 0 build succeeds) or use the live Railway URL.
2. Using a browser automation tool (Playwright, if available) or manual navigation, load the chat page and:
   - trigger a `MISSING_DETAILS` scenario and capture a screenshot showing the blue badge and the suggestion chips;
   - trigger a `PENDING_REVIEW` scenario and capture a screenshot showing the amber badge and escalation reason;
   - trigger a `REJECTED` scenario and capture a screenshot showing the red badge;
   - trigger an `APPROVED`/successful reservation and capture a screenshot showing the green badge and PDF download button;
   - test drag-and-drop file upload and capture a screenshot of the upload state;
   - check that long filenames are truncated with ellipsis rather than breaking the layout;
   - check dark-mode readability and color contrast for all badge colors.
3. Save all screenshots into a folder, e.g. `verification_screenshots/`.
4. Report, for each screenshot, whether the actual rendered UI matches the intended design (badge color, chip text, layout, no visual overflow/breakage). Do not describe intended behavior — describe what is actually rendered in the screenshot.
5. If any UI element is missing, broken, or visually unprofessional (e.g. unstyled default HTML elements, overlapping text, no spacing), fix it in `components/ChatUI.tsx` and re-capture the screenshot to confirm the fix.

==================================================
PHASE 5 — FINAL REPORT
==================================================

Update:

```text
PHASE_6_VERIFICATION_REPORT.md
```

Replace the previous "physically blocked" conclusion with actual literal evidence for every phase above: build output, database query results, scenario JSON responses, PDF byte proof, and frontend screenshot descriptions.

Use exactly one final status:

```text
VERIFIED — READY FOR DEPLOYMENT
VERIFIED WITH BLOCKERS
NOT VERIFIED
```

==================================================
PHASE 6 — DEPLOY TO RAILWAY (ONLY IF PHASE 5 STATUS IS "VERIFIED — READY FOR DEPLOYMENT")
==================================================

Do not deploy if any earlier phase failed or remains unverified.

If and only if verification passed:

1. Commit and push all fixes to `CHAFIKBOULEALAM/kiraa-agent-platform` on branch `main`.
2. Deploy:
```bash
railway up
```
3. Confirm the live app starts, `railway logs` shows no errors, and no secret is printed.
4. Re-run the health check:
```bash
curl -i [https://kiraa-agent-platform-production.up.railway.app/api/health](https://kiraa-agent-platform-production.up.railway.app/api/health)
```
5. Re-run at least 3 of the 10 scenarios from Phase 3 directly against the freshly redeployed live URL to confirm the fixes are actually live, not just present in local code.
6. Create:
```text
RAILWAY_FINAL_DEPLOYMENT_REPORT.md
```
with the redeployment evidence and final status:
```text
RAILWAY_DEPLOYMENT = PASS
RAILWAY_DEPLOYMENT = READY WITH BLOCKERS
RAILWAY_DEPLOYMENT = FAIL
```

Do not report PASS unless the live redeployed application demonstrably fixes the "dassi" misclassification and the PDF crash, confirmed with real requests against the live URL.