export enum DevEnvironment {
  Local,
  Stage,
  Prod,
}

export type PostgresConfig = {
    host: string
    port: number
    database: string
    user: string
    password:string
}

export type Config = {
    dbConfig: PostgresConfig
    apiPort: number
}

export function createConfig(env: DevEnvironment): Config{
    if (env != DevEnvironment.Local) {
        throw new Error("Stage and Prod configs are not yet implemented")
    }

    return {
        apiPort: 3000,
        dbConfig: {
            host: "localhost",
            port: 5432,
            database: "appdb",
            user: "postgres",
            password: "postgres",
        } 
    }
}