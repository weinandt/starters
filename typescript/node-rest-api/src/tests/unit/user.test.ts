import { describe, it } from 'node:test'

import request = require('supertest')

import { createApp } from '../../app'
import type { CreatedUser, User, UserGateway } from '../../user/userGateway'

class InMemoryUserGateway implements UserGateway {
    constructor(private readonly usersById: Map<string, User>) {}

    async getUser(userId: string): Promise<User | null> {
        return this.usersById.get(userId) ?? null
    }

    async createUser(username: string): Promise<CreatedUser> {
        const id = '0198f6e2-8c00-7000-8000-000000000010'
        this.usersById.set(id, { username })

        return { id, username }
    }
}

describe('user routes', () => {
    it('gets a user response by id', async () => {
        const userId = '0198f6e2-8c00-7000-8000-000000000001'
        const userGateway = new InMemoryUserGateway(new Map<string, User>([
            [userId, { username: 'alice' }],
        ]))
        const app = createApp({ userGateway })

        await request(app).get(`/users/${userId}`).expect(200).expect({ username: 'alice' })
    })

    it('creates a user response', async () => {
        const userGateway = new InMemoryUserGateway(new Map())
        const app = createApp({ userGateway })

        await request(app)
            .post('/users')
            .send({ username: 'dana' })
            .expect(201)
            .expect({
                id: '0198f6e2-8c00-7000-8000-000000000010',
                username: 'dana',
            })
    })

    it('returns not found when no user exists for the id', async () => {
        const userGateway = new InMemoryUserGateway(new Map())
        const app = createApp({ userGateway })

        await request(app).get('/users/0198f6e2-8c00-7000-8000-000000000002').expect(404)
    })
})
