# DuckLake with Postgres and DuckDB CLI

Run everything from inside this directory.

## One Time Set Up

- Make the data directory where the parquet files will be kept: `mkdir -p data/ducklake`

## Run
1. Start all containers: `docker compose up -d`
2. Open a DuckDB CLI session inside the DuckDB container: `docker compose exec duckdb duckdb`
3. Load the pre-installed DuckDB extensions, then attach DuckLake to the Postgres catalog:

```sql
LOAD ducklake;
LOAD postgres;

ATTACH 'ducklake:postgres:dbname=ducklake_catalog host=postgres user=ducklake password=ducklake' AS lake
  (DATA_PATH 'data/ducklake/', DATA_INLINING_ROW_LIMIT 0);

USE lake;
```

4. Create a table:
```sql
CREATE TABLE events (
  event_id INTEGER,
  event_name VARCHAR,
  occurred_at TIMESTAMP
);

INSERT INTO events VALUES
  (1, 'created ducklake table', now()),
  (2, 'persisted parquet files', now());

SELECT * FROM events;
```

5. See the change data feed for the 'last week':

```sql
FROM table_changes('events', now() - INTERVAL '1 week', now());
```

6. Inspect postgres: `docker compose exec postgres psql -U ducklake -d ducklake_catalog`

`select * from ducklake_column;`

Should see the three columns.

7. Clean Up

The named volumes survive `docker compose down`. To delete named volumes, run `docker compose down -v`.

Ducklake docs: https://ducklake.select/docs/stable/
