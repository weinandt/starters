import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import request = require('supertest')

import { createApp } from '../../app'
import type { CreatedUser, User, UserGateway } from '../../user/userGateway'

describe('user validation', () => {
    it('requires the user id path parameter to be a guid', async () => {
        let gatewayWasCalled = false
        const userGateway: UserGateway = {
            async getUser(): Promise<User | null> {
                gatewayWasCalled = true
                return null
            },
            async createUser(): Promise<CreatedUser> {
                throw new Error('createUser should not be called')
            },
        }
        const app = createApp({ userGateway })

        const response = await request(app).get('/users/1').expect(400)

        assert.equal(gatewayWasCalled, false)
        assert.equal(response.body.message, 'request/params/id must match format "uuid"')
    })

    it('validates the username response type', async () => {
        const userGateway: UserGateway = {
            async getUser(): Promise<User | null> {
                return { username: 123 } as unknown as User
            },
            async createUser(): Promise<CreatedUser> {
                throw new Error('createUser should not be called')
            },
        }
        const app = createApp({ userGateway })

        const response = await request(app)
            .get('/users/0198f6e2-8c00-7000-8000-000000000001')
            .expect(500)

        assert.equal(response.body.message, '/response/username must be string')
    })
})
