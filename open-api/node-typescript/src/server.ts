import express from 'express'
import swaggerUI from 'swagger-ui-express'
import fs from "node:fs"
import yaml from 'yaml'

const file  = fs.readFileSync('./openapi.yaml', 'utf8')
const swaggerDocument = yaml.parse(file)
const app = express()
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))

app.listen(3000, () => {
    console.log('Started. Docs at: http://localhost:3000/docs')
})