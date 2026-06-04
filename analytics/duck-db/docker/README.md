# Run DuckDB In Docker

## Run In This Directory With Local Volume
`docker run --rm -it -v "$(pwd):/workspace" -w /workspace duckdb/duckdb`

## List Files In the Current Directory:

`SELECT * FROM glob('*');`

Should show this README.md

## Write An Example Table to Parquet File

```sql
-- Create an example table
CREATE TABLE people AS
SELECT 
  1 AS id,
  'Alice' AS name,
  25 AS age,
  50000 AS salary
UNION ALL
SELECT 2, 'Bob', 30, 60000
UNION ALL
SELECT 3, 'Charlie', 35, 70000;

-- Write the table to a Parquet file (default Snappy compression)
COPY people
TO 'people.parquet'
(FORMAT parquet);
```