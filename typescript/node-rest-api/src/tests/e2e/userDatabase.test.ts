import assert from 'node:assert/strict'
import type { Server as HttpServer } from 'node:http'
import { after, before, describe, it } from 'node:test'

import { Pool } from 'pg'

import { createApp } from '../../app'
import { createConfig, DevEnvironment } from '../../config'
import { closeServer, listen, readJson, startPostgresAndSetUpTables } from './e2eUtils'
import { type StartedPostgreSqlContainer } from '@testcontainers/postgresql'

describe('user database e2e', () => {
    let postgres: StartedPostgreSqlContainer | null = null
    let pool: Pool | null = null
    let server: HttpServer | null = null
    let baseUrl: string | null = null

    before(async () => {
        const databaseConfig = createConfig(DevEnvironment.Local).dbConfig
        postgres = await startPostgresAndSetUpTables(databaseConfig)
        pool = new Pool(databaseConfig)

        const app = createApp({ pool })
        const testServer = await listen(app)
        server = testServer.server
        baseUrl = testServer.baseUrl
    })

    after(async () => {
        await closeServer(server)
        await pool?.end()
        await postgres?.stop()
    })

    it('creates a user and gets the created user', async () => {
        type CreatedUserResponse = {
            id: string
            username: string
        }

        type UserResponse = {
            username: string
        }

        const username = 'dana'

        const createResponse = await fetch(`${baseUrl}/users`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({ username }),
        })
        const createdUser = await readJson<CreatedUserResponse>(createResponse)

        assert.equal(createResponse.status, 201)
        assert.deepEqual(createdUser, {
            id: createdUser.id,
            username,
        })

        const getResponse = await fetch(`${baseUrl}/users/${createdUser.id}`)
        const user = await readJson<UserResponse>(getResponse)

        assert.equal(getResponse.status, 200)
        assert.deepEqual(user, { username })
    })
})
