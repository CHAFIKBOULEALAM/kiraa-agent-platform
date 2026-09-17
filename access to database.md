You can inspect the PostgreSQL database directly from the Docker container using `psql`. This lets you verify that the tables exist and view their data.

## 1. Open PowerShell

Open **PowerShell** or the terminal inside your project folder:

```powershell
cd "C:\Users\ACER\OneDrive - usmba.ac.ma\Documents\chafik\ESISA\3éme années\machine learning-salma\hackaton\dossier-hackhaton-v2\notebook-tutorial\Kiraa-project"
```

First, confirm your Docker containers are running:

```powershell
docker compose ps
```

You should see something similar to:

```text
NAME                  SERVICE    STATUS
kiraa-project-app-1   app        Up (healthy)
kiraa-project-db-1    db         Up (healthy)
```

Your PostgreSQL service is likely called `db`.

## 2. Open PostgreSQL terminal

Run this command:

```powershell
docker compose exec db psql -U kiraa -d kiraa
```

Explanation:

- `docker compose exec db` enters the container whose Compose service name is `db`.
- `psql` opens PostgreSQL’s interactive terminal.
- `-U kiraa` connects with PostgreSQL user `kiraa`.
- `-d kiraa` selects the database named `kiraa`.

After it connects, you should see a prompt like:

```text
kiraa=#
```

## 3. List all tables

At the `kiraa=#` prompt, run:

```sql
\dt
```

This displays every table in the current database.

You should see tables similar to:

```text
public | fleet_catalog
public | customer_profiles
public | booking_logs
public | seasonal_pricing_matrix
public | rental_policies_vectors
public | checkpoints
public | checkpoint_blobs
public | checkpoint_writes
```

If you see these tables, they exist.

## 4. View table structure

To see the columns of a table:

```sql
\d fleet_catalog
```

Other useful commands:

```sql
\d customer_profiles
\d booking_logs
\d seasonal_pricing_matrix
\d rental_policies_vectors
```

For LangGraph checkpoint tables:

```sql
\d checkpoints
\d checkpoint_blobs
\d checkpoint_writes
```

## 5. Count records

To see how many rows exist in each table:

```sql
SELECT COUNT(*) FROM fleet_catalog;
SELECT COUNT(*) FROM customer_profiles;
SELECT COUNT(*) FROM booking_logs;
SELECT COUNT(*) FROM seasonal_pricing_matrix;
SELECT COUNT(*) FROM rental_policies_vectors;
```

You should expect approximately:

```text
fleet_catalog             → 50 rows
customer_profiles         → 20 rows
booking_logs              → 25 rows
seasonal_pricing_matrix   → around 60 rows
rental_policies_vectors   → around 26 rows
```

The exact RAG-vector count depends on how `rental_policies.md` was split into chunks.

## 6. View actual data

To display the first rows of each table:

```sql
SELECT * FROM fleet_catalog LIMIT 5;
```

```sql
SELECT * FROM customer_profiles LIMIT 5;
```

```sql
SELECT * FROM booking_logs LIMIT 5;
```

```sql
SELECT * FROM seasonal_pricing_matrix LIMIT 10;
```

For RAG chunks, do not display the entire vector because it will be very large. Instead use:

```sql
SELECT
  id,
  LEFT(content_chunk, 200) AS content_preview
FROM rental_policies_vectors
LIMIT 5;
```

To check vector dimensions:

```sql
SELECT
  id,
  vector_dims(embedding) AS vector_dimension
FROM rental_policies_vectors
LIMIT 5;
```

To verify that embeddings are not empty:

```sql
SELECT
  id,
  embedding IS NOT NULL AS has_embedding,
  vector_dims(embedding) AS dimension
FROM rental_policies_vectors
LIMIT 5;
```

## 7. Check pgvector installation

Inside `psql`, run:

```sql
SELECT extname
FROM pg_extension
WHERE extname = 'vector';
```

Expected result:

```text
 extname
---------
 vector
```

That confirms pgvector is enabled.

## 8. Exit PostgreSQL

When finished, type:

```sql
\q
```

You will return to PowerShell.

## One-command shortcuts

You do not need to enter interactive mode if you only want a quick check.

### List tables

```powershell
docker compose exec db psql -U kiraa -d kiraa -c "\dt"
```

### Count all main tables

```powershell
docker compose exec db psql -U kiraa -d kiraa -c "
SELECT 'fleet_catalog' AS table_name, COUNT(*) AS rows FROM fleet_catalog
UNION ALL
SELECT 'customer_profiles', COUNT(*) FROM customer_profiles
UNION ALL
SELECT 'booking_logs', COUNT(*) FROM booking_logs
UNION ALL
SELECT 'seasonal_pricing_matrix', COUNT(*) FROM seasonal_pricing_matrix
UNION ALL
SELECT 'rental_policies_vectors', COUNT(*) FROM rental_policies_vectors;
"
```

### Show first five vehicles

```powershell
docker compose exec db psql -U kiraa -d kiraa -c "SELECT * FROM fleet_catalog LIMIT 5;"
```

### Check pgvector

```powershell
docker compose exec db psql -U kiraa -d kiraa -c "SELECT extname FROM pg_extension WHERE extname = 'vector';"
```

If your Docker Compose service is not named `db`, first run:

```powershell
docker compose ps
```

Then replace `db` in every command with the name shown in the **SERVICE** column.