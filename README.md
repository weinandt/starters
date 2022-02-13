# GraphQL Server In a Single Lambda

Run an entire graphql server in a single lambda. Use aws api gateway to register a single http endpoint (/graphql).

## Run Locally
`node src/localServer.js`

## Infrastructure Set Up
1. Create lambda (don't add a trigger).
1. Create a new api in api gateway (http api, not REST).
1. Add the `/graphql` "route" to the api.
1. Add an integration to the route and attach the route to the previously created lambda.

## Middleware Explanation
- cors: allows cross origin requests to be made to the lambda from the browser.
- express.json: parses json payloads: https://expressjs.com/en/api.html#express.json

## TODO
- Test cross origin requests.