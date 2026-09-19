# Critical Review — Antigravity Phase 7B (v2, merged with headed-mode request)

## Recap of earlier findings (unchanged)
- Removing `E2E_TEST_MODE` was the right call — it forces real DB-backed testing instead of a synthetic bypass.
- The Postgres Catch-22 (Docker dead locally, Railway DB private-only) is genuine, not an excuse.
- **Do not push to GitHub as the fix.** Try Railway's temporary TCP Proxy on the Postgres service (Settings → Networking → `DATABASE_PUBLIC_URL`) first, point local `.env` at it for testing only, then disable it again afterward.
- `.env` must never be read, printed, or committed; all commands must stay scoped to `notebook-tutorial\Kiraa-project`.
- Run a `docker info` health check before any Docker-dependent step (script below).

## Review of the new headed-mode request

The ask (headed Chrome, `slowMo: 500`, split UI vs. API test modes) is reasonable and matches good practice for visually monitoring agent-driven browser tests. Two risks were fixed before merging it in:

1. **"Launch now" bypassing preflight** — headed mode does nothing to fix the underlying DB blocker. The merged prompt keeps Docker/DB verification as a hard gate *before* any Playwright run, headed or not.
2. **Timeout headroom** — `slowMo: 500` per action can push total scenario time close to the existing 120s timeout across multi-step UI flows. The visible-UI project now gets a longer timeout (`180_000`) so slowed-down runs don't fail purely on time.

## Docker pre-flight (unchanged, still required first)

```powershell
# check-docker.ps1
Write-Host "Checking Docker Desktop status..."
$dockerInfo = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker daemon is NOT running or unreachable." -ForegroundColor Red
    Write-Host $dockerInfo
    Write-Host "Attempting to start Docker Desktop..."
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Write-Host "Waiting up to 60s for daemon to become ready..."
    $ready = $false
    for ($i = 0; $i -lt 12; $i++) {
        Start-Sleep -Seconds 5
        docker info > $null 2>&1
        if ($LASTEXITCODE -eq 0) { $ready = $true; break }
    }
    if (-not $ready) {
        Write-Host "Docker still not responding after 60s. Manual repair needed." -ForegroundColor Red
        exit 1
    }
}
Write-Host "Docker daemon is healthy." -ForegroundColor Green
docker compose up -d
```

## Merged Professional Prompt (paste this to Antigravity)

> **Objective**: Validate the Kiraa agent platform end-to-end, with UI/monitoring tests visibly running in Chrome, without deploying to production and without touching any files outside `notebook-tutorial\Kiraa-project`.
>
> **Hard constraints (in priority order — do not skip or reorder):**
> 1. Do not run `git push`, `git commit`, or trigger any Railway deployment under any circumstance in this task.
> 2. Do not read, print, modify, or commit `notebook-tutorial\Kiraa-project\.env`. Treat it as fully out of scope.
> 3. Scope every file edit, grep, and command strictly to `notebook-tutorial\Kiraa-project`. Run `git status` before and after changes to confirm nothing outside this folder was touched.
> 4. **Before running anything Docker-dependent**, run `docker info` and report the exact output. If the daemon is unhealthy, stop and report — do not fall back to `MemorySaver` or reintroduce `E2E_TEST_MODE` as a workaround.
> 5. To resolve the Postgres connectivity blocker, check the Railway Postgres service's Settings → Networking for an existing TCP Proxy / `DATABASE_PUBLIC_URL`. If none exists, enable one temporarily, use it only for local `DATABASE_URL` in this session, and explicitly flag that it should be disabled again once testing is done. Do not proceed to run tests until this connection is confirmed working (test with a simple query, not just a Playwright run).
> 6. Only once steps 4–5 are confirmed healthy, update `playwright.config.ts` to run UI/monitoring specs in **headed mode** with `slowMo: 500`, using the installed Google Chrome (`channel: 'chrome'`) so the browser window is visibly on screen, while keeping pure backend/API specs in headless mode. Increase the timeout for the headed project to account for the added `slowMo` delay.
> 7. Run `npx playwright test --project=ui-chrome-visible` for the visible suite and `npx playwright test --project=api-headless` for API specs. Paste the full, untruncated terminal output for both.
> 8. Produce a final report covering: (a) exact files changed, (b) confirmation `.env` was never touched, (c) confirmation no command ran outside `notebook-tutorial\Kiraa-project`, (d) the Docker and DB-connectivity check results, (e) full Playwright pass/fail output for both projects, (f) an explicit recommendation on push-readiness — but do not push it yourself.
