# Open API Node/Typescript

## Generating Types
Types used in the server are generated from the openapi spec. There is a cli tool which does the generation called `open api generator`: https://openapi-generator.tech/docs

Any time the spec types are updated, run: `npm run generate-types`. This command requires docker as that is where the type generator cli is going to run. This command will update the `src/generated-types` directory.

The cli tool can also be used to generate clients/types in other languages.

## Known Issues
- Validation: express-openapi-validator
    - Doesn't support open api spec versions greater than 3.0.0: https://github.com/cdimascio/express-openapi-validator/issues/573
    - Validates the spec asynchronously and doesn't return the error until the middleware is called.

## TODO:
- Api server mocks which can be imported in other service's tests
- How to handle 301 redirects (so auth servers can re-direct)
- How to use for security testing
- How to set up auth for docs, so users can test api in the browser

### Tests to Write
- Validation of request and response.