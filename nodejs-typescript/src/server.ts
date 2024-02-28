import path from 'node:path'

// Reading the graphql schema from disk
const pathToSchema = path.join(__dirname, 'schema.graphql')
console.log(pathToSchema)
