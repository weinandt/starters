const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const { buildSchema } = require('graphql')
const path = require('path')
const fs = require('fs')
const { ManualDI } = require('./manualDi')
const { Resolvers } = require('./resolvers')
const { addResolversToSchema } = require('@graphql-tools/schema')
const cors = require('cors')


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
    app.use(cors())
    app.use(express.json())

    app.use('/graphql', graphqlHTTP({
        schema: schemaWithResolvers,
        graphiql: true,
    }))

    return app
}

module.exports = {
    createApp
}