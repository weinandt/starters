import { existsSync } from 'node:fs'
import type { Server as HttpServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { type Express } from 'express'

import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql'

import type { PostgresConfig } from '../../config'
import { setUpDbSchema } from '../../db/setUpLocal'

export type RunningTestServer = {
    server: HttpServer
    baseUrl: string
}

function setDockerEnvVariables(): void {
    const runningColima = existsSync(join(homedir(), '.colima/default/docker.sock'))
    if (runningColima) {
        // Following docs here: https://node.testcontainers.org/supported-container-runtimes/#colima
        process.env.DOCKER_HOST = `unix://${homedir()}/.colima/default/docker.sock`
        process.env.TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE = "/var/run/docker.sock"
    }
}

export async function startPostgresAndSetUpTables(dbConfig: PostgresConfig): Promise<StartedPostgreSqlContainer> {
    setDockerEnvVariables()

    const container = await new PostgreSqlContainer("postgres:18.4")
        .withDatabase(dbConfig.database)
        .withUsername(dbConfig.user)
        .withPassword(dbConfig.password)
        .withExposedPorts({ container: 5432, host: dbConfig.port })
        .start()

    await setUpDbSchema(dbConfig)

    return container
}

export async function readJson<T>(response: Response): Promise<T> {
    return await response.json() as T
}

export async function listen(app: Express): Promise<RunningTestServer> {
    return await new Promise((resolve, reject) => {
        const server = app.listen(0, '127.0.0.1', () => {
            const address = server.address() as AddressInfo
            resolve({
                server,
                baseUrl: `http://127.0.0.1:${address.port}`,
            })
        })
        server.once('error', reject)
    })
}

export async function closeServer(server: HttpServer | null): Promise<void> {
    if (server == null) {
        return
    }

    await new Promise<void>((resolve, reject) => {
        server.close((error) => {
            if (error != null) {
                reject(error)
                return
            }

            resolve()
        })
    })
}
