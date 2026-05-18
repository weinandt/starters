import { existsSync } from 'node:fs'
import type { Server as HttpServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { setTimeout } from 'node:timers/promises'

import Dockerode = require('dockerode')
import { Client } from 'pg'

import type { PostgresConfig } from '../../config'
import type { createApp } from '../../app'
import { setUpDbSchema } from '../../db/setUpLocal'

export type RunningPostgres = {
    container: Dockerode.Container
    config: PostgresConfig
    stop(): Promise<void>
}

export type RunningTestServer = {
    server: HttpServer
    baseUrl: string
}

function createDockerClient(): Dockerode {
    const dockerHost = process.env.DOCKER_HOST
    if (dockerHost?.startsWith('unix://') === true) {
        return new Dockerode({ socketPath: dockerHost.slice('unix://'.length) })
    }

    // Mac colima may have different docker sockets path settings.
    const socketPaths = [
        join(homedir(), '.docker/run/docker.sock'),
        join(homedir(), '.colima/default/docker.sock'),
        '/var/run/docker.sock',
    ]
    const socketPath = socketPaths.find((path) => existsSync(path))

    return new Dockerode(socketPath == null ? undefined : { socketPath })
}

async function buildPostgresImage(client: Dockerode, imageTag: string): Promise<void> {
    const buildStream = await client.buildImage(
        {
            context: join(process.cwd(), 'src/db'),
            src: ['Dockerfile'],
        },
        {
            t: imageTag,
            rm: true,
            forcerm: true,
        },
    )

    await new Promise<void>((resolve, reject) => {
        client.modem.followProgress(buildStream, (error) => {
            if (error != null) {
                reject(error)
                return
            }

            resolve()
        })
    })
}

async function startPostgresImage(
    client: Dockerode,
    imageName: string,
    config: PostgresConfig,
): Promise<RunningPostgres> {
    const containerName = `node-rest-api-postgres-${process.pid}-${Date.now()}`
    const container = await client.createContainer({
        name: containerName,
        Image: imageName,
        Env: [
            `POSTGRES_USER=${config.user}`,
            `POSTGRES_PASSWORD=${config.password}`,
            `POSTGRES_DB=${config.database}`,
        ],
        ExposedPorts: {
            '5432/tcp': {},
        },
        HostConfig: {
            PortBindings: {
                '5432/tcp': [
                    {
                        HostIp: config.host === 'localhost' ? '127.0.0.1' : config.host,
                        HostPort: String(config.port),
                    },
                ],
            },
        },
    })

    try {
        await container.start()
        await waitForPostgres(config, container)

        return {
            container,
            config,
            async stop(): Promise<void> {
                await container.remove({ force: true }).catch(() => undefined)
            },
        }
    } catch (error: unknown) {
        await container.remove({ force: true }).catch(() => undefined)
        throw error
    }
}

async function waitForPostgres(
    config: PostgresConfig,
    container: Dockerode.Container,
    timeoutMs = 60_000,
): Promise<void> {
    const deadline = Date.now() + timeoutMs
    let lastError: unknown

    while (Date.now() < deadline) {
        const containerInfo = await container.inspect().catch(() => null)
        if (containerInfo?.State?.Running === false) {
            throw new Error(`Postgres container exited before it was ready: ${containerInfo.State.Status}`)
        }

        const postgresClient = new Client(config)
        try {
            await postgresClient.connect()
            await postgresClient.query('SELECT 1')
            return
        } catch (error: unknown) {
            lastError = error
        } finally {
            await postgresClient.end().catch(() => undefined)
        }

        await setTimeout(500)
    }

    throw new Error(`Timed out waiting for Postgres to be ready: ${String(lastError)}`)
}

export async function startPostgresAndSetUpTables(imageName: string, dbConfig: PostgresConfig): Promise<RunningPostgres> {
    const client = createDockerClient()
    await buildPostgresImage(client, imageName)
    const imageHandle = await startPostgresImage(client, imageName, dbConfig)

    await setUpDbSchema(dbConfig)

    return {
        ...imageHandle,
        async stop(): Promise<void> {
            await imageHandle.stop()
            await client.getImage(imageName).remove({ force: true }).catch(() => undefined)
        },
    }
}

export async function readJson<T>(response: Response): Promise<T> {
    return await response.json() as T
}

export async function listen(app: ReturnType<typeof createApp>): Promise<RunningTestServer> {
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
