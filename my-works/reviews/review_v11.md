The GitHub stage is complete according to the push report: the repository is private under `CHAFIKBOULEALAM/kiraa-agent-platform`, on the `main` branch, and Antigravity reports a successful remote push with a secret scan pass. The local project report also shows healthy Docker services, seeded PostgreSQL tables, 384-dimensional pgvector embeddings, checkpoint rows, and a 10/10 Playwright run. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/151485498/b54c2391-70e4-4f79-80c6-d54b448631b7/Kiraa_Cahier_des_Charges_updated-javascript-2.pdf?AWSAccessKeyId=ASIA2F3EMEYEQ7YCKXN7&Signature=IINd1yeKZ4%2BzEw0uiLnoInFJm60%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEGgaCXVzLWVhc3QtMSJGMEQCIDDIzu3e4aUf2X9oqVLv6gLyDevR8JRNHb73f6UEEwLkAiB2MlKgYh7u9KBnD%2B2NOD%2Bv%2BEVfKOVDr95Z3OnZwnG2hSrzBAgwEAEaDDY5OTc1MzMwOTcwNSIMvG4ZOXyLYZDw8qLVKtAEKkFmwF4qJvwV5RvOoQn4VdM6P4OpqIFmPAuoeICN9otN%2B%2FPBYz%2FjcvlJa7t9fYyv70gBvrZakOwiJvjFATDpOcg8ppDGyuzmgwWcdvPAdoWxpI4GOsIlfc2NKiOWDOxTXQbN8s7vykx05p0kfMNMPdVKq0w7cVXClf7N8I1xI9C9nkzYF5aGZLTQ59KLM4cfTYz32cb%2FJwAZ02QLfD3c8qCasKjadsgHzZNMMz%2Fx776q640vdXpq%2BmvfpCuTXGC5ySkbFaS2KcUR6S7s4AqY8R0GL8ugJ1en2CW1kuX8j5hP9jIYtSX0JrFhSlCSbRQU8ijK2eK%2F34qtnIWnjuK9n0ABD6z6rcvN%2FrEGCUtPhk9kGhV1EDHMTM0oyAw0iQ57Q4dP1au8ccoWC%2BUlOPFW9UaF89gGKgp1Bg6Em5PCxEJmWwRPWf9NlnsjjpaZA7Cg7ewBpbbfcRxYVTG5NCIMrA0QfzkoUTdVvHTxvyh0xTfNhkVpmVItyvCQeqbyKBtfaDnux6j6UzMYwxlGNqAgi3b86Ef4YHPHBj1pG5aa1iG0d7ZaTQu6bd%2Bl0bQew5D2bn5Cy33WKfBpK7xP1zeW7VPHXntrfvpWzUsAvMRLDYauatHJUAimHhOR3NTGy4fn7irH0JCd1ugNu%2BInVyxaFLqmnOGxiIzPyGzK2P%2F8duYFS648nDz0%2BU4BXYSa0Qc6GnaUO7ZmzlVBEALpRGw2nHZBiM5%2F6n%2FwKpKuJo4VstsvHZ76FQv77vOxoeEr9YMFO1Cbdh6Bx4Ch8HWKlpRe8TCRjLDVBjqZAYgDu2ZVCjKG8gmmHFpw6fCGRjuTvkrOKdIPmyThGoP11%2Fv%2FjbBthJIUiziENbc%2BTHTGu3xqFNsXJtnxrgGz1JYWZuoy7%2BeXT8Zx5C3A1rauJVmqLbRKOJ6tzHyvRSMZHqphBKpYQ9%2B5khHw%2FFrXmJ%2BHzhGWG7yfSzh8ofs6oip%2BG%2B5YS8IPcgmw3ergCzWT0jk0WfyXCmD9tQ%3D%3D&Expires=1789662180)

For Railway, the safest next step is to **link the existing Railway project**—not create another one—and use Railway CLI for deployment, environment variables, database provisioning, migrations, seed, and live smoke tests. Your Railway project is already imported manually as [patient-courtesy](https://railway.com/project/57857353-0426-42ae-a276-630ec231e8b8).

Before deployment, ensure your previously exposed Groq key has been revoked and replaced. Do not ever paste the new key into Antigravity chat, GitHub, `.env.example`, or README.

## Prompt for Antigravity

Copy this prompt exactly into Antigravity IDE:

```text
ROLE

You are a senior Railway Deployment Engineer, DevOps Engineer, Next.js Engineer, PostgreSQL/pgvector Engineer, LangGraph.js Engineer, GitHub Engineer, and Security Engineer.

Deploy the existing Kiraa project from:

```text
notebook-tutorial/Kiraa-project
```

The project has already been pushed to this private GitHub repository:

```text
CHAFIKBOULEALAM/kiraa-agent-platform
```

The repository branch is:

```text
main
```

The existing manually imported Railway project is:

```text
patient-courtesy
```

Railway project URL:

```text
[https://railway.com/project/57857353-0426-42ae-a276-630ec231e8b8](https://railway.com/project/57857353-0426-42ae-a276-630ec231e8b8)
```

IMPORTANT:

- Link and deploy to this existing Railway project. Do not create a duplicate Railway project.
- Deploy only the source from `notebook-tutorial/Kiraa-project`.
- Do not deploy an unrelated repository such as `pylon`.
- Do not create a separate frontend/backend architecture.
- Do not expose, print, paste, commit, or log secrets.
- Do not read `.env` in a way that prints values.
- Do not use the previously exposed Groq key. It must be considered revoked/compromised.
- Do not use `E2E_TEST_MODE=true` in Railway.
- Do not claim Railway deployment is successful until the live HTTPS application, PostgreSQL, pgvector, migrations, seed, RAG, LangGraph checkpointing, OCR, and health route are verified in Railway.

Use the following binding references:

1. `Kiraa_JS_Conversion_Prompt.md`
2. `Kiraa_Cahier_des_Charges_updated-javascript.pdf`
3. `FINAL_FORENSIC_RUNTIME_REPORT.md`
4. `GITHUB_PREP_REPORT.md`
5. `GITHUB_PUSH_REPORT.md`
6. `README.md`

==================================================
PHASE 0 — PRE-DEPLOYMENT SECURITY CHECK
==================================================

Before using Railway CLI:

1. Confirm the Git remote from `notebook-tutorial/Kiraa-project`:

```bash
git remote -v
git branch --show-current
gh repo view CHAFIKBOULEALAM/kiraa-agent-platform --json nameWithOwner,url,visibility,defaultBranchRef
```

2. Confirm:

```text
Repository = CHAFIKBOULEALAM/kiraa-agent-platform
Visibility = PRIVATE
Branch = main
```

3. Confirm `.env` is not tracked:

```bash
git ls-files .env .env.local .env.production .env.development
git check-ignore -v .env
```

4. Scan the current project source before deployment for secrets.

Search all source, configuration, Markdown, scripts, Docker files, data, and sample files for:

```text
gsk_
sk-
GROQ_API_KEY=
DATABASE_URL=
GITHUB_TOKEN=
GH_TOKEN=
RAILWAY_TOKEN=
```

Do not print actual secret values.

Report only:

```text
PRE_DEPLOY_SECRET_SCAN = PASS | FAIL
LOCAL_ENV_NOT_TRACKED = PASS | FAIL
GITHUB_REMOTE_CORRECT = PASS | FAIL
```

Stop immediately if a real secret is found in tracked source.

==================================================
PHASE 1 — INSTALL AND AUTHENTICATE RAILWAY CLI
==================================================

From `notebook-tutorial/Kiraa-project`, check whether Railway CLI is installed:

```bash
railway --version
```

If it does not exist, install it using the official Railway CLI package:

```powershell
npm install -g @railway/cli
```

Then verify:

```bash
railway --version
```

Authenticate safely:

```bash
railway login
```

Use Railway's browser login flow.

Never ask the user to paste a Railway token into chat.

After login, run:

```bash
railway whoami
```

Report only the Railway account name/email shown by the CLI. Do not expose tokens.

==================================================
PHASE 2 — LINK THE EXISTING RAILWAY PROJECT
==================================================

Do not run `railway init` unless linking the existing project fails and user confirmation is obtained.

From the project root:

```text
notebook-tutorial/Kiraa-project
```

link the existing Railway project:

```bash
railway link
```

Select the already existing project:

```text
patient-courtesy
```

Confirm it corresponds to Railway project ID:

```text
57857353-0426-42ae-a276-630ec231e8b8
```

After linking, run:

```bash
railway status
railway environment
railway service
```

If Railway CLI requires an explicit project selection, use the existing project ID and do not create another project.

Report:

```text
RAILWAY_PROJECT = patient-courtesy
RAILWAY_PROJECT_ID = 57857353-0426-42ae-a276-630ec231e8b8
RAILWAY_LINK = PASS | FAIL
RAILWAY_ENVIRONMENT = <actual environment>
```

==================================================
PHASE 3 — INSPECT CURRENT RAILWAY SERVICES
==================================================

Before creating any services, inspect the existing Railway project.

Run the appropriate Railway CLI commands to list services and variables safely.

Determine whether the project already contains:

- a Next.js/Node application service;
- a PostgreSQL database service;
- persistent storage;
- an assigned public domain;
- environment variables;
- deployment settings.

Do not print variable values.

Report:

```text
APP_SERVICE_EXISTS = YES | NO
POSTGRES_SERVICE_EXISTS = YES | NO
PUBLIC_DOMAIN_EXISTS = YES | NO
```

If an existing app service is linked to a different GitHub repository, do not overwrite it. Stop and report the mismatch.

==================================================
PHASE 4 — POSTGRESQL AND PGVECTOR ON RAILWAY
==================================================

The Kiraa project requires persistent PostgreSQL with pgvector.

First determine whether the existing Railway PostgreSQL service supports the `vector` extension.

Use Railway shell or an appropriate safe command to run:

```sql
SELECT extname FROM pg_extension WHERE extname = 'vector';
```

If `vector` exists, use the existing PostgreSQL service.

If it does not exist, do not claim compliance with plain PostgreSQL.

Instead:

1. Provision or deploy a PostgreSQL service/image compatible with pgvector.
2. Attach persistent Railway storage.
3. Ensure the application receives its database URL through Railway environment variables only.
4. Enable the vector extension through a safe database initialization or migration step.
5. Verify again:

```sql
SELECT extname FROM pg_extension WHERE extname = 'vector';
```

The final result must contain:

```text
vector
```

Report:

```text
RAILWAY_POSTGRESQL = PASS | FAIL | BLOCKED
RAILWAY_PGVECTOR_EXTENSION = PASS | FAIL | BLOCKED
DATABASE_PERSISTENCE = PASS | FAIL | BLOCKED
```

==================================================
PHASE 5 — RAILWAY ENVIRONMENT VARIABLES
==================================================

Configure Railway environment variables only through Railway CLI or Railway project settings.

Do not commit secrets to GitHub. Do not write real values to `.env.example`. Do not print variable values in logs.

Required server-side variables:

```text
DATABASE_URL=<Railway internal PostgreSQL URL>
GROQ_API_KEY=<new, valid, non-exposed Groq key>
LLM_MODEL=qwen/qwen3.8-27b
EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2
NODE_ENV=production
```

Do not configure these variables in Railway production:

```text
E2E_TEST_MODE=true
GITHUB_TOKEN
GH_TOKEN
NEXT_PUBLIC_GROQ_API_KEY
NEXT_PUBLIC_DATABASE_URL
```

Requirements:

1. `DATABASE_URL` must use Railway's internal PostgreSQL service URL, never localhost.
2. `GROQ_API_KEY` must be configured only as a Railway secret.
3. `E2E_TEST_MODE` must be missing or false.
4. No LLM or database credentials may be exposed to the frontend.
5. Verify variable names only, with values redacted.

Report:

```text
RAILWAY_DATABASE_URL_CONFIGURED = PASS | FAIL
RAILWAY_GROQ_API_KEY_CONFIGURED = PASS | FAIL
RAILWAY_LLM_MODEL_CONFIGURED = PASS | FAIL
RAILWAY_EMBEDDING_MODEL_CONFIGURED = PASS | FAIL
RAILWAY_E2E_TEST_MODE_DISABLED = PASS | FAIL
RAILWAY_SECRETS_SERVER_SIDE_ONLY = PASS | FAIL
```

If a new Groq key is required, stop and ask the user to configure it directly in the Railway dashboard. Do not request the value in chat.

==================================================
PHASE 6 — DEPLOY THE APPLICATION
==================================================

Confirm deployment source before deploying:

```bash
git status
git log -1 --oneline
git remote -v
```

Verify no `.env` or secret file is staged or committed.

Deploy the current `main` branch of:

```text
CHAFIKBOULEALAM/kiraa-agent-platform
```

to the existing Railway project `patient-courtesy`.

Use Railway CLI deployment:

```bash
railway up
```

or the correct Railway CLI command for the installed version.

Do not deploy from outside:

```text
notebook-tutorial/Kiraa-project
```

After deployment:

```bash
railway status
railway logs
```

Verify:

- the Next.js application starts successfully;
- production runtime is Node.js compatible;
- no secret appears in logs;
- database connection succeeds;
- application uses `PostgresSaver`, not `MemorySaver`;
- `E2E_TEST_MODE` is disabled;
- application can access PostgreSQL;
- application can access pgvector;
- application can access the configured LLM only server-side.

==================================================
PHASE 7 — MIGRATIONS, SEED, AND RAILWAY DATA
==================================================

Run migrations and seed inside the Railway app context, using the Railway PostgreSQL connection.

Do not use local Docker URLs or localhost.

Run the documented commands, for example:

```bash
railway run npm run db:migrate
railway run npm run db:seed
```

If Railway CLI syntax differs, use the current supported command equivalent.

Never run destructive truncate/reset commands in Railway production.

Verify the following tables have data:

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

Expected requirements:

- pgvector extension exists;
- vectors are non-zero;
- vector dimension is 384 for `Xenova/all-MiniLM-L6-v2`;
- policy chunks originate only from `rental_policies.md`;
- seed is non-destructive;
- seed is idempotent;
- checkpoint tables exist.

Run the seed a second time only if the script is explicitly safe and idempotent.

Report safe counts and status:

```text
RAILWAY_MIGRATIONS = PASS | FAIL
RAILWAY_SEED = PASS | FAIL
RAILWAY_SEED_IDEMPOTENCY = PASS | FAIL
RAILWAY_FLEET_COUNT = ...
RAILWAY_CUSTOMER_COUNT = ...
RAILWAY_BOOKING_COUNT = ...
RAILWAY_SEASONAL_PRICING_COUNT = ...
RAILWAY_POLICY_VECTOR_COUNT = ...
RAILWAY_VECTOR_DIMENSION = ...
```

==================================================
PHASE 8 — PUBLIC HTTPS DOMAIN AND HEALTHCHECK
==================================================

Get or create a public Railway domain for the application.

Use Railway CLI, for example:

```bash
railway domain
```

or the equivalent current Railway command.

Verify the domain uses HTTPS.

Then run:

```bash
curl -i https://<RAILWAY_PUBLIC_DOMAIN>/api/health
```

The health route must:

- return success only when the app is alive;
- perform a real PostgreSQL `SELECT 1` check;
- report database state safely;
- never expose secrets, connection strings, stack traces, or private error details.

Report:

```text
RAILWAY_HTTPS_DOMAIN = ...
RAILWAY_HEALTH_ENDPOINT = PASS | FAIL
RAILWAY_DATABASE_HEALTH = PASS | FAIL
```

==================================================
PHASE 9 — LIVE PRODUCTION SMOKE TESTS
==================================================

Run real production smoke tests against the public Railway HTTPS domain.

Ensure:

```text
E2E_TEST_MODE is absent or false
```

Do not use local test-mode behavior.

Test:

1. Policy RAG request:

```text
Puis-je annuler gratuitement 24 heures avant la prise en charge ?
```

Verify:

- intent is `policy_query`;
- pgvector retrieves policy chunks;
- sources/citations come from `rental_policies.md`;
- no price result is produced.

2. Eligibility request with valid data.

Verify deterministic eligibility result is returned.

3. Real JPG identity/licence upload.

Verify:

- file is accepted;
- real OCR path executes;
- OCR confidence and extraction status are shown;
- no static/fake OCR output is returned.

4. Valid deterministic price request using a supported code:

```text
FLASH25
```

or:

```text
SUMMER20
```

Verify:

- the effective discount is capped at 15%;
- deterministic pricing controls the amount;
- LLM does not create the price.

5. Young driver + Premium request.

Verify:

```text
needsHumanReview = true
bookingStatus = PENDING_REVIEW
deposit = baseDeposit × 1.5
escalationReasons is non-empty
```

6. PostgresSaver persistence test.

Send two requests with a stable safe thread/session ID and verify persisted checkpoints are created in Railway PostgreSQL.

Do not display personal data, source documents, or secrets in the deployment report.

Report every test as:

```text
PASS
FAIL
BLOCKED
```

==================================================
PHASE 10 — DEPLOYMENT REPORT
==================================================

Create:

```text
RAILWAY_DEPLOYMENT_REPORT.md
```

The report must include:

1. Railway CLI version.
2. Railway project name and ID.
3. Railway environment name.
4. GitHub repository and branch deployed.
5. Confirmation that the deployed source was only `notebook-tutorial/Kiraa-project`.
6. Docker/Railway build result.
7. PostgreSQL provisioning result.
8. pgvector extension result.
9. Railway migration result.
10. Railway seed result and safe table counts.
11. Embedding model, dimension, and non-zero vector confirmation.
12. PostgreSQL RAG retrieval result.
13. PostgresSaver checkpoint persistence result.
14. HTTPS public domain.
15. `/api/health` result.
16. Production-mode smoke-test results.
17. Confirmation `E2E_TEST_MODE` is disabled.
18. Security findings.
19. Known limitations.
20. Final Railway deployment status:

```text
RAILWAY_DEPLOYMENT = PASS
RAILWAY_DEPLOYMENT = READY WITH BLOCKERS
RAILWAY_DEPLOYMENT = FAIL
```

Do not say PASS unless the deployed Railway URL, Railway PostgreSQL, pgvector, migrations, seed, real RAG, PostgresSaver, OCR, deterministic engine, health route, and security checks are actually verified.
```

## Deployment sequence

1. Rotate the old Groq key.
2. Configure the new Groq key directly in Railway—not in GitHub or chat.
3. Give Antigravity the prompt above.
4. Let it install/link Railway CLI and inspect the existing `patient-courtesy` project.
5. Ensure Railway has a pgvector-capable PostgreSQL service before deployment.
6. Verify the public HTTPS URL only after migration and seed complete.