ROLE

You are a senior QA engineer performing the final pre-deployment gate for the Kiraa project. Do not push to GitHub or trigger any Railway deployment until every item below is satisfied with complete, untruncated, literal evidence.

==================================================
STEP 1 — PROVE ALL 10 SCENARIOS RAN, NOT JUST 8
==================================================

The last report's Playwright output showed "Running 8 tests" but claimed "10 Scenarios". Resolve this discrepancy.

1. Run only the scenarios file in isolation, listing every test:
```bash
npx playwright test tests/e2e/scenarios.spec.ts --workers=1 --list
```
Paste the full literal list of test names discovered.

2. Then run it for real:
```bash
npx playwright test tests/e2e/scenarios.spec.ts --workers=1
```
Paste the FULL literal output, including every individual test name and its PASS/FAIL status, not just the summary line. If fewer than 10 scenario tests exist, explain exactly which ones are missing and implement them now.

3. Run the multi-turn continuity test separately:
```bash
npx playwright test tests/e2e/multi_turn_continuity.spec.ts --workers=1
```
Paste its full literal output too.

Do not combine or summarize these two files' results together again — report each file's results separately and completely.

==================================================
STEP 2 — PROVIDE THE UNTRUNCATED BUILD OUTPUT
==================================================

Run:
```bash
npm run build
```
Paste the ENTIRE output from start to finish, with no `...` truncation, no omitted lines. If route sizes genuinely show 0 B for all routes, explain why that is expected for this Next.js version and confirm the app actually serves real content when run (verify with a real request, not just trusting the build report).

==================================================
STEP 3 — RUN THE FULL SUITE IN HEADED, HUMAN-LIKE MONITORING MODE
==================================================

I want to visually watch this run like a real person typing in a real Chrome window, not a fast headless script. Configure and run this properly:

1. Update `playwright.config.ts` (or create a dedicated config) to support a headed, slowed-down run:
```ts
use: {
  headless: false,
  launchOptions: { slowMo: 400 },
  trace: 'on',
  video: 'on',
  screenshot: 'on',
}
```

2. In the test files, replace instant `fill()` calls with human-like typing where practical, using:
```ts
await page.locator('[data-testid="chat-input"]').pressSequentially('je voudrais une voiture dassi pendant 2 jours', { delay: 80 });
```
so text appears character-by-character like a real user, followed by a deliberate pause before pressing Enter (e.g. `await page.waitForTimeout(500);`).

3. Run the complete suite (both files) in this headed, human-paced mode:
```bash
npx playwright test tests/e2e/scenarios.spec.ts tests/e2e/multi_turn_continuity.spec.ts --workers=1 --headed --project=chromium
```

4. Confirm the browser window was actually visible during execution (this must run on a machine/session where a display is available; if running in a headless CI-like environment where a real window cannot be shown, use `xvfb` or equivalent virtual display and still produce the video recordings).

5. Save every video recording to a clearly named folder:
```text
verification_videos/final_gate/
```

6. For at least 3 of the 10 scenarios plus the full multi-turn continuity test, describe what is ACTUALLY visible in the recorded video — the typing animation, the loading state, the badge appearing, the text rendering — as if you watched it yourself. Do not describe intended behavior; describe what the video actually shows.

==================================================
STEP 4 — RE-TEST WITH VARIED, REALISTIC PHRASING (NOT THE EXACT FIXTURE SENTENCES)
==================================================

The previous fix worked by choosing test sentences that happen to match real fleet vehicles ("FIAT 500", "Porsche Panamera") with clean explicit dates. Prove this isn't fragile by testing different, more natural phrasing for the same scenarios:

1. "Je cherche une petite citadine, genre une Fiat, pour le weekend du 10 au 12 octobre" (vaguer vehicle reference, relative dates)
2. "J'ai 19 ans et je veux savoir si je peux louer une voiture" (no explicit license date, natural phrasing)
3. "Bonjour, avez-vous des Porsche disponibles ? J'ai 23 ans." (missing dates entirely, informal greeting)

Run these three through the real app (browser or API) and report the actual response. If the system correctly asks for missing details or correctly resolves the vehicle in each case, that's real evidence of generalization. If it fails or hallucinates, report that honestly — do not adjust these new test sentences to force a pass.

==================================================
STEP 5 — CONFIRM THE E2E_TEST_MODE BYPASS REMOVAL WITH A DIFF
==================================================

Paste the actual `git diff` (or before/after code) for the `route.ts` change that removed the `E2E_TEST_MODE` intent-bypass logic, so I can see exactly what was removed and confirm nothing equivalent remains elsewhere in the codebase.

Also run:
```bash
grep -rn "E2E_TEST_MODE" app/ lib/ components/
```
and paste the full literal output, confirming every remaining usage is limited to non-business-logic purposes (like deterministic PDF dates), with the exact line and file for each match.

==================================================
STEP 6 — FINAL GATE DECISION
==================================================

Only after Steps 1–5 are complete with full literal, untruncated evidence, report:

```text
ALL_10_SCENARIOS_CONFIRMED = YES | NO
BUILD_OUTPUT_VERIFIED_UNTRUNCATED = YES | NO
HEADED_HUMAN_LIKE_MONITORING_COMPLETE = YES | NO
VARIED_PHRASING_RETEST_RESULT = PASS | FAIL
E2E_TEST_MODE_BYPASS_FULLY_REMOVED = YES | NO
FINAL_GATE_STATUS = READY TO DEPLOY | NOT READY
```

Wait for my explicit approval before running `git push` or any Railway deployment command.

==================================================
STEP 7 — DEPLOYMENT AND LIVE CONFIRMATION (ONLY AFTER MY APPROVAL)
==================================================

Once I approve:

1. Push:
```bash
git push
```
2. Confirm Railway redeploys (via `railway status` and `railway logs`), and watch for the specific Zod parsing error you found earlier:
```text
Intent LLM Error: ... "extractedParams": null ...
```
Confirm this exact error no longer appears in fresh logs after the new deployment goes live.
3. Re-run at least 3 of the 10 scenarios directly against the live Railway URL (not localhost) and paste the literal responses.
4. Create a final report:
```text
RAILWAY_POST_DEPLOYMENT_VERIFICATION.md
```
confirming the live app no longer exhibits the original bug, with literal evidence from the production URL itself.