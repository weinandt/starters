const { createApp } = require('./app')

// Only need a port when running locally.
const port = 3000

const app = createApp()
app.listen(port)

console.log(`Started server. Use: http://localhost:${port}/graphql`)