import { assert } from 'console'
import { Server } from './server'
import { describe, it } from 'node:test';

describe('Server tests', () => {
    it('test', () => {
        const server = new Server()
        assert(server.start())
    })
})