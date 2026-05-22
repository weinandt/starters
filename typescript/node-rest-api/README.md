# node-typescript-setup

A project which can be used as a base project for those who want a rest api in node js.

## Type generation

API types are generated from the OpenAPI document in `openapi.json`.

Run the generator with:

```sh
npm run create-types
```

That script runs `openapi-typescript` against `openapi.json` and writes the generated output to `src/schema.ts`. Do not edit `src/schema.ts` directly; update `openapi.json` and regenerate it instead.

When changing the API contract, run:

```sh
npm run double-check
```

This regenerates the types, builds the project, and runs the test suite.

## Local Run

Start the database in one terminal:

```sh
npm run db
```

Then start the API in another terminal:

```sh
npm run local
```

Swagger UI is available at:

```text
http://localhost:3000/api-docs
```

The raw OpenAPI document is served at:

```text
http://localhost:3000/openapi.json
```

## E2E Tests

E2E tests live in `src/tests/e2e`.

They use `testcontainers` to start a temporary `postgres:18` container, wait until the database accepts connections, create the schema tables, and then run API calls against a locally started Express server.

The database-backed e2e test does not use `supertest`; it sends real HTTP requests with `fetch`.

Docker must be running before running:

```sh
npm test
```

## Debugging in VSCode
Just open the `package.json` in vscode. You'll see debug above scripts.

Just go to debugging tab and select either the "Debug Server" or "Debug Tests"

## TODO
- Implement postgres pagination for a list api
    - Try uuidv7 as a pagination key
        - determine if there any security issues
- Have skils to do db reviews to ensure all queries are on indexes
- Implement throttling and quotas
