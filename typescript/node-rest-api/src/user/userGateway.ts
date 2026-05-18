import type { Pool } from 'pg'

import type { QueryMap } from '../db/parseQueries'

export type User = {
    username: string
}

export type CreatedUser = {
    id: string
    username: string
}

export interface UserGateway {
    getUser(userId: string): Promise<User | null>
    createUser(username: string): Promise<CreatedUser>
}

export class PostgresUserGateway implements UserGateway {
    private readonly pool: Pool
    private readonly getUserQuery: string
    private readonly createUserQuery: string

    constructor(pool: Pool, queries: QueryMap) {
        const getUserQuery = queries.get('user.getUser')
        if (getUserQuery == null) {
            throw new Error('Missing SQL query "user.getUser"')
        }

        const createUserQuery = queries.get('user.createUser')
        if (createUserQuery == null) {
            throw new Error('Missing SQL query "user.createUser"')
        }

        this.pool = pool
        this.getUserQuery = getUserQuery
        this.createUserQuery = createUserQuery
    }

    async getUser(userId: string): Promise<User | null> {
        const result = await this.pool.query<User, [string]>(this.getUserQuery, [userId])
        const user = result.rows[0]
        if (user == null) {
            return null
        }

        return { username: user.username }
    }

    async createUser(username: string): Promise<CreatedUser> {
        const result = await this.pool.query<CreatedUser, [string]>(this.createUserQuery, [username])
        const user = result.rows[0]
        if (user == null) {
            throw new Error('Expected createUser query to return a user')
        }

        return { id: user.id, username: user.username }
    }
}
