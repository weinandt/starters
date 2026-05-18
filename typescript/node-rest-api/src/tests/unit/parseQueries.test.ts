import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseQueries } from '../../db/parseQueries'

describe('parseQueries', () => {
    it('parses named SQL queries from the queries directory', () => {
        const queries = parseQueries()

        assert.equal(
            queries.get('user.getUser'),
            [
                'SELECT username',
                'FROM users',
                'WHERE id = $1::uuid;',
            ].join('\n'),
        )
        assert.equal(
            queries.get('user.createUser'),
            [
                'INSERT INTO users (username)',
                'VALUES ($1)',
                'RETURNING id::text AS id, username;',
            ].join('\n'),
        )
    })
})
