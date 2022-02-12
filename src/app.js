const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const { buildSchema } = require('graphql')
const path = require('path')
const fs = require('fs')
const { ManualDI } = require('./manualDi')
const { Resolvers } = require('./resolvers')
const { addResolversToSchema } = require('@graphql-tools/schema')


const readSchemaAsString = () => {
    const schemaAsString = fs.readFileSync(path.join(__dirname, 'schema.graphql'), { encoding: 'utf-8' })

    return schemaAsString
}

const createApp = () => {
    const schema = buildSchema(readSchemaAsString())
    const resolvers = new Resolvers(ManualDI.createResolvers())
    const schemaWithResolvers = addResolversToSchema({
        schema,
        resolvers: resolvers.getResolvers(),
    })

    const app = express()
    app.use('/graphql', graphqlHTTP({
        schema: schemaWithResolvers,
        graphiql: true,
    }))

    return app
}

const app = createApp()
app.listen(3000)