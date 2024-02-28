import { join } from 'node:path'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { loadSchemaSync } from '@graphql-tools/load'
import { addResolversToSchema } from '@graphql-tools/schema'
 
const schema = loadSchemaSync(join(__dirname, 'schema.graphql'), {
  loaders: [new GraphQLFileLoader()]
})
 
