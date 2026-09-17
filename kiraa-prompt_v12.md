ROLE

You are a senior DevOps Engineer, Railway Deployment Engineer, Next.js Engineer, PostgreSQL/pgvector Engineer, GitHub Engineer, and Security Engineer.

Deploy the Kiraa project from:

```text
notebook-tutorial/Kiraa-project
```

Use Railway CLI to authenticate, create/link the Railway project, provision PostgreSQL, configure secrets, deploy the application, verify health, and document the deployment.

Do not create a new project outside this directory. Do not deploy the parent `notebook-tutorial` folder. The Railway deployment source must be only:

```text
notebook-tutorial/Kiraa-project
```

==================================================
PRECONDITIONS
==================================================

Before using Railway:

1. Read:
   ```text
   GITHUB_PREP_REPORT.md
   GITHUB_PUSH_REPORT.md
   FINAL_FORENSIC_RUNTIME_REPORT.md
   README.md
   ```

2. Continue only if:
   ```text
   FINAL_GITHUB_STATUS = PUSHED
   ```
   and the final local verification report states:
   ```text
   READY FOR SUBMISSION
   ```

3. Verify the GitHub remote belongs to:

```text
CHAFIKBOULEALAM
```

4. Verify the source repository is private unless the user explicitly requests public visibility.

5. Do not read, print, copy, expose, commit, upload, or log:
   - `.env`
   - `GITHUB_TOKEN`
   - `GH_TOKEN`
   - `GITHUB_TOKEN`
   - `GROQ_API_KEY`
   - `DATABASE_URL`
   - PostgreSQL password
   - Railway token

6. The project `.env` currently contains GitHub-related variables:

```env
GITHUB_USERNAME=chafikboulealam
GITHUB_TOKEN=
```

Do not use `GITHUB_TOKEN` from `.env` for Railway authentication.

Do not add a GitHub token to `.env`.

GitHub authentication must use GitHub CLI credentials already stored on the machine:

```bash
gh auth status
```

The expected GitHub account is:

```text
CHAFIKBOULEALAM
```

If needed:

```bash
gh auth switch -u CHAFIKBOULEALAM
```

The associated GitHub profile/repository context is:

```text
[https://github.com/CHAFIKBOULEALAM/pylon](https://github.com/CHAFIKBOULEALAM/pylon)
```

Do not print tokens or credentials in any output.

==================================================
PHASE 1 — INSTALL AND AUTHENTICATE RAILWAY CLI
==================================================

From the project directory:

```text
notebook-tutorial/Kiraa-project
```

check whether Railway CLI exists:

```bash
railway --version
```

If Railway CLI is missing, install it using the official supported installation method for Windows. Prefer:

```powershell
npm install -g @railway/cli
```

After installation, verify:

```bash
railway --version
```

Authenticate Railway CLI using browser/device login:

```bash
railway login
```

Do not ask the user to paste a token into chat.

Use the interactive Railway login flow so the user authorizes the CLI through their Railway account.

Then verify authentication safely:

```bash
railway whoami
```

Report only the authenticated Railway account name or email if the command displays it safely. Never display a token.

==================================================
PHASE 2 — CREATE OR LINK RAILWAY PROJECT
==================================================

Inspect the current folder and Git remote:

```bash
git remote -v
git branch --show-current
gh repo view --json nameWithOwner,url,visibility
```

Confirm that the GitHub repository owner is:

```text
CHAFIKBOULEALAM
```

Do not assume the repository is `pylon`. The current Kiraa project must use its own dedicated repository, for example:

```text
CHAFIKBOULEALAM/kiraa-agent-platform
```

If the Kiraa repository does not exist or is not pushed, stop and report:

```text
RAILWAY_DEPLOYMENT = BLOCKED
REASON = Kiraa GitHub repository not pushed or not linked.
```

If the repository is correct:

1. Create a new Railway project or link an existing Kiraa Railway project:

```bash
railway init
```

2. Use a clear name such as:

```text
kiraa-agent-platform
```

3. Do not accidentally link the unrelated `pylon` repository or another project.

4. Verify Railway project linkage:

```bash
railway status
```

Report:

```text
RAILWAY_PROJECT = ...
RAILWAY_ENVIRONMENT = ...
GITHUB_REPOSITORY = CHAFIKBOULEALAM/<actual-kiraa-repository>
```

==================================================
PHASE 3 — PROVISION POSTGRESQL WITH PGVECTOR
==================================================

The project requires PostgreSQL with pgvector.

First inspect Railway’s current services:

```bash
railway status
railway service
```

Provision PostgreSQL through Railway CLI or Railway dashboard integration.

If Railway’s standard PostgreSQL plugin does not provide pgvector support, do not silently deploy a plain PostgreSQL database and claim compliance.

Instead, deploy a PostgreSQL image that includes pgvector support, such as a supported pgvector PostgreSQL image, and attach persistent Railway storage.

Requirements:

- PostgreSQL database must be persistent.
- pgvector extension must be enabled.
- Database connection URL must be available only as a Railway server-side secret.
- The deployed app must use the Railway internal database URL, not localhost.
- The app must not expose database credentials to the browser.

After provisioning, verify pgvector from a safe Railway shell or a temporary secure SQL command:

```sql
SELECT extname FROM pg_extension WHERE extname = 'vector';
```

The result must include:

```text
vector
```

Report:

```text
RAILWAY_POSTGRES = PASS | FAIL | BLOCKED
RAILWAY_PGVECTOR = PASS | FAIL | BLOCKED
```

==================================================
PHASE 4 — CONFIGURE RAILWAY ENVIRONMENT VARIABLES
==================================================

Configure variables using Railway CLI, not by committing them to Git.

Use:

```bash
railway variables set KEY=value
```

or the appropriate Railway CLI command for the installed version.

Set only server-side secrets and required configuration:

```text
DATABASE_URL=<Railway internal PostgreSQL connection URL>
GROQ_API_KEY=<user-provided current secret or existing Railway secret>
LLM_MODEL=qwen/qwen3.8-27b
EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2
NODE_ENV=production
```

Do not set:

```text
E2E_TEST_MODE=true
GITHUB_TOKEN
GH_TOKEN
NEXT_PUBLIC_GROQ_API_KEY
NEXT_PUBLIC_DATABASE_URL
```

Requirements:

1. `E2E_TEST_MODE` must be absent or false in Railway production.
2. `GROQ_API_KEY` must never be logged.
3. `DATABASE_URL` must remain server-side only.
4. `GITHUB_TOKEN` must not be used by the deployed app.
5. Do not place any secret in source code, `.env.example`, README, Dockerfile, docker-compose.yml, or GitHub repository.
6. Verify variables exist only by listing their names, not their values.

Run a safe variables inspection command and redact values.

Report:

```text
RAILWAY_DATABASE_URL_CONFIGURED = PASS | FAIL
RAILWAY_GROQ_KEY_CONFIGURED = PASS | FAIL
RAILWAY_E2E_TEST_MODE_DISABLED = PASS | FAIL
RAILWAY_SECRETS_SERVER_SIDE_ONLY = PASS | FAIL
```

==================================================
PHASE 5 — DEPLOY NEXT.JS APPLICATION
==================================================

Before deployment, verify current local source is clean:

```bash
git status
git log -1 --oneline
```

Confirm there are no uncommitted secret files.

Deploy from the Kiraa project root only:

```bash
railway up
```

If Railway uses a GitHub integration instead, link the existing repository:

```text
CHAFIKBOULEALAM/<actual-kiraa-repository>
```

and verify Railway is deploying the correct repository and branch.

Do not deploy the `pylon` project unless the user explicitly asks for it. `pylon` is account context only, not the Kiraa deployment target.

After deployment, inspect logs:

```bash
railway logs
```

Verify:

- Next.js starts successfully.
- Database connection succeeds.
- No secrets appear in logs.
- Migrations run safely.
- Seed behavior is controlled and non-destructive.
- The application does not fall back to `MemorySaver`.
- The app uses `PostgresSaver`.
- RAG uses Railway PostgreSQL pgvector.
- `E2E_TEST_MODE` is disabled.

==================================================
PHASE 6 — RUN MIGRATIONS, SEED, AND HEALTH CHECK
==================================================

Run the documented Railway production setup commands in the correct Railway service context.

Requirements:

1. Apply Drizzle migrations.
2. Enable pgvector if migration/init has not already done so.
3. Run the seed exactly once for initial production data.
4. Confirm seed is idempotent and non-destructive.
5. Do not run a destructive reset or truncate command in Railway production.
6. Verify required table data.
7. Verify LangGraph checkpoint tables.
8. Verify real non-zero RAG embeddings.

Use Railway shell or supported Railway CLI command to run:

```bash
npm run db:migrate
npm run db:seed
```

Then verify:

```sql
SELECT COUNT(*) FROM fleet_catalog;
SELECT COUNT(*) FROM customer_profiles;
SELECT COUNT(*) FROM booking_logs;
SELECT COUNT(*) FROM seasonal_pricing_matrix;
SELECT COUNT(*) FROM rental_policies_vectors;
SELECT COUNT(*) FROM checkpoints;
```

Verify:

```sql
SELECT extname FROM pg_extension WHERE extname = 'vector';
SELECT vector_dims(embedding) FROM rental_policies_vectors LIMIT 1;
```

Report exact safe counts and dimensions.

==================================================
PHASE 7 — PUBLIC URL AND PRODUCTION SMOKE TESTS
==================================================

Get the Railway public deployment URL:

```bash
railway domain
```

or use the correct command for the installed CLI version.

Verify the URL uses HTTPS.

Run:

```bash
curl -i https://<railway-domain>/api/health
```

The health route must prove actual PostgreSQL connectivity and must not return secrets.

Run real production smoke tests with `E2E_TEST_MODE` disabled:

1. Policy question:
```text
Puis-je annuler gratuitement 24 heures avant la prise en charge ?
```

2. Eligibility request with valid data.

3. Real JPG identity/licence upload.

4. A valid deterministic price request using a real supported discount code, such as `FLASH25` or `SUMMER20`.

5. Young-driver Premium request:
   - must require human review;
   - must use deposit +50%;
   - must not falsely confirm the booking.

Verify:

- RAG returns policy passages from Railway PostgreSQL pgvector.
- OCR uses the real production OCR path.
- LangGraph uses PostgresSaver.
- deterministic engine controls money and eligibility.
- no API key/DB secrets appear in responses.
- request traces and errors are handled safely.

Do not run or enable `E2E_TEST_MODE` in the Railway production environment.

==================================================
PHASE 8 — DEPLOYMENT REPORT
==================================================

Create:

```text
RAILWAY_DEPLOYMENT_REPORT.md
```

Include:

1. Railway CLI version.
2. Railway authenticated account, safely redacted.
3. Railway project name and environment.
4. GitHub repository name and branch deployed.
5. Confirmation that deployment source is only `notebook-tutorial/Kiraa-project`.
6. PostgreSQL provisioning status.
7. pgvector verification result.
8. Migration result.
9. Seed result and table counts.
10. Embedding model, vector dimension, and non-zero verification.
11. PostgresSaver checkpoint verification.
12. Public HTTPS URL.
13. `/api/health` response status.
14. Production smoke-test results.
15. Confirmation `E2E_TEST_MODE` is disabled.
16. Security findings.
17. Known limitations, if any.
18. Final deployment status:

```text
RAILWAY_DEPLOYMENT = PASS
RAILWAY_DEPLOYMENT = READY WITH BLOCKERS
RAILWAY_DEPLOYMENT = FAIL
```

Do not state PASS unless the live HTTPS application, Railway PostgreSQL, pgvector, migrations, seed, RAG, OCR, PostgresSaver, and health endpoint are all proven in the Railway environment.