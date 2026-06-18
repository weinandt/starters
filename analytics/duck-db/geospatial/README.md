# GeoSpatial

## Calculate the Area of a US County

Run duckdb in a docker container in this directory:

```bash
docker run --rm -it -v "$(pwd):/workspace" -w /workspace duckdb/duckdb
```

```sql
INSTALL spatial;
INSTALL httpfs;
LOAD spatial;
LOAD httpfs;

-- Reading counties geojson into a duckdb table.
CREATE TABLE counties AS
SELECT * FROM ST_Read('counties.geojson');

-- Data is in lat,lon order (CRS84), but need to convert to EPSG:5070 to get 3D -> 2D.
SELECT
    ST_Area(ST_Transform(geom, 'OGC:CRS84', 'EPSG:5070')) / 2589988.1103 AS area_sq_miles
FROM counties
WHERE NAME = 'Saratoga';
```

Should get `842.53` sq miles.