import { join } from 'node:path'

import express, { type ErrorRequestHandler, type Express } from 'express'
import * as OpenApiValidator from 'express-openapi-validator'
import { Pool } from 'pg'

import { parseQueries, type QueryMap } from './db/parseQueries'
import { PostgresUserGateway, type UserGateway } from './user/userGateway'
import { UserInteractor } from './user/userInteractor'
import { createUserRouter } from './user/userRoutes'

export type RouteDependencies = {
    pool?: Pool
    queries?: QueryMap
    userGateway?: UserGateway
}

export function createApp(dependencies: RouteDependencies = {}): Express {
    const pool = dependencies.pool ?? new Pool()
    const queries = dependencies.queries ?? parseQueries()
    const userGateway = dependencies.userGateway ?? new PostgresUserGateway(pool, queries)
    const userInteractor = new UserInteractor(userGateway)
    const userRouter = createUserRouter(userInteractor)

    const app = express()

    app.use(express.json())

    app.use((req, res, next) => {
        console.log(`${req.method} ${req.originalUrl}`);
        next();
    });

    app.use(OpenApiValidator.middleware({
        apiSpec: join(process.cwd(), 'openapi.json'),
        validateRequests: true,
        validateResponses: true,
    }))

    app.use('/', userRouter)
    app.use(openApiValidationErrorHandler)

    return app
}

const openApiValidationErrorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    response.status(error.status ?? 500).json({
        message: error.message,
        errors: error.errors ?? [],
    })
}
