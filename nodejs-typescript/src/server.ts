import { join } from 'node:path'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { loadSchemaSync } from '@graphql-tools/load'
import { addResolversToSchema } from '@graphql-tools/schema'
import express from 'express'
import { createHandler } from 'graphql-http/lib/use/express'
import expressPlayground from 'graphql-playground-middleware-express'

const schema = loadSchemaSync(join(__dirname, 'schema.graphql'), {
    loaders: [new GraphQLFileLoader()]
})

const resolvers = {
    Query: {
        // TODO: add actual types: https://www.apollographql.com/docs/apollo-server/data/resolvers/#resolver-arguments
        curTime: (parent: any, args: any, context: any, info: any) => { return new Date().toISOString() },
    },
}

const schemaWithResolvers = addResolversToSchema({ schema, resolvers })

const app = express()
app.use('/graphql', createHandler({
    schema: schemaWithResolvers,
}))

app.get('/playground', expressPlayground({ endpoint: '/graphql' }))

const port = 3000
app.listen(port)

console.log(`Server started. Playground at: http://localhost:${port}/playground`)