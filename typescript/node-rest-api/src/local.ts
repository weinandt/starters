import { Pool } from 'pg'

import { createApp } from './app'
import { setUpLocalDatabase } from './db/setUpLocal'
import { createConfig, DevEnvironment } from './config'

async function main(): Promise<void> {
    const config = createConfig(DevEnvironment.Local)
    await setUpLocalDatabase(config.dbConfig)

    const app = createApp({
        pool: new Pool(config.dbConfig),
    })

    app.listen(config.apiPort, () => {
        console.log(`Server running at http://localhost:${config.apiPort}`);
    });
}

main().catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
})
