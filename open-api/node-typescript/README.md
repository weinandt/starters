# Open API Node/Typescript

## Known Issues
- Validation: express-openapi-validator
    - Doesn't support open api spec versions greater than 3.0.0: https://github.com/cdimascio/express-openapi-validator/issues/573
    - Validates the spec asynchronously and doesn't return the error until the middleware is called.

## TODO:
- SDK generation
    - Typescript
    - Golang
- Api server mocks which can be imported in other service's tests
- How to handle 301 redirects (so auth servers can re-direct)
- How to use for security testing
- How to set up auth for docs, so users can test api in the browser
- Determine if you need express-swagger-ui or if you can just distribute the open api spec and some html.

### Tests to Write
- Validation of request and response.