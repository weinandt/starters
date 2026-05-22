import assert from 'node:assert/strict'
import type { Server as HttpServer } from 'node:http'
import { after, before, describe, it } from 'node:test'

import { createApp } from '../../app'
import type { CreatedUser, User, UserGateway } from '../../user/userGateway'
import { closeServer, listen, readJson } from './e2eUtils'

const unusedUserGateway: UserGateway = {
    async getUser(): Promise<User | null> {
        return null
    },
    async createUser(username: string): Promise<CreatedUser> {
        return {
            id: '00000000-0000-4000-8000-000000000000',
            username,
        }
    },
}

describe('swagger e2e', () => {
    let server: HttpServer | null = null
    let baseUrl: string | null = null

    before(async () => {
        const app = createApp({ userGateway: unusedUserGateway })
        const testServer = await listen(app)
        server = testServer.server
        baseUrl = testServer.baseUrl
    })

    after(async () => {
        await closeServer(server)
    })

    it('serves the OpenAPI document', async () => {
        type OpenApiDocument = {
            openapi: string
            info: {
                title: string
            }
            paths: Record<string, unknown>
        }

        const response = await fetch(`${baseUrl}/openapi.json`)
        const openApiDocument = await readJson<OpenApiDocument>(response)

        assert.equal(response.status, 200)
        assert.match(response.headers.get('content-type') ?? '', /application\/json/)
        assert.equal(openApiDocument.openapi, '3.1.0')
        assert.equal(openApiDocument.info.title, 'User API')
        assert.ok(openApiDocument.paths['/users'])
    })

    it('serves Swagger UI', async () => {
        const response = await fetch(`${baseUrl}/api-docs`)
        const html = await response.text()

        assert.equal(response.status, 200)
        assert.match(response.headers.get('content-type') ?? '', /text\/html/)
        assert.match(html, /Swagger UI/)
        assert.match(html, /swagger-ui-bundle\.js/)
    })
})
