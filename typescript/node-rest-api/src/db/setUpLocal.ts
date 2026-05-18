import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { Client, type ClientConfig } from 'pg'
import { PostgresConfig } from '../config'

async function readSqlFile(filename: string): Promise<string> {
    return readFile(join(__dirname, filename), 'utf8')
}

export async function setUpDbSchema(config: PostgresConfig): Promise<void> {
    const client = new Client(config)

    await client.connect()
    try {
        await client.query(await readSqlFile('schema.sql'))
    } finally {
        await client.end()
    }
}

export async function setUpLocalDatabase(config: PostgresConfig): Promise<void> {
    await setUpDbSchema(config)

    const client = new Client(config)
    await client.connect()
    try {
        await client.query(await readSqlFile('schema.sql'))
        await client.query(await readSqlFile('local_setup.sql'))
    } finally {
        await client.end()
    }
}
