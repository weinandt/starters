import express from 'express'
import swaggerUI from 'swagger-ui-express'
import fs from "node:fs"
import yaml from 'yaml'
import * as OpenApiValidator from 'express-openapi-validator';
import { Board } from './generated-types/model/models';

const file  = fs.readFileSync('./openapi.yaml', 'utf8')
const swaggerDocument = yaml.parse(file)
const app = express()

// Middleware.
app.use((err: any, req: any, res: any, next: any) => {
    // format error
    res.status(err.status || 500).json({
      message: err.message,
      errors: err.errors,
    });
  });
  


// Routes.
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))
// This will also validate the spec.

const validationMiddleware = OpenApiValidator.middleware({
  apiSpec: "./openapi.yaml",
  validateRequests: true, // (default)
  validateResponses: true, // false by default.

})
app.use(validationMiddleware);
app.get('/board', (req: any, res: any) => {
    const board: Board = {
      test: 'asdf',
      testInteger: 1
    }
    res.status(200).json(board)
})





app.listen(3000, () => {
    console.log('Started. Docs at: http://localhost:3000/docs')
})