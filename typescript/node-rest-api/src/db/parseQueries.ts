import { readFileSync, readdirSync } from 'node:fs'
import { extname, join } from 'node:path'

export type QueryMap = Map<string, string>

const queryNamePattern = /\/\*\s*@name\s+([A-Za-z0-9_.-]+)\s*\*\//g

type NamedQuery = {
    name: string
    sql: string
}

export function parseQueries(queriesDirectory = join(__dirname, 'queries')): QueryMap {
    const queries = new Map<string, string>()
    const sqlFileNames = readdirSync(queriesDirectory)
        .filter((fileName) => extname(fileName) === '.sql')
        .sort()

    for (const fileName of sqlFileNames) {
        const filePath = join(queriesDirectory, fileName)
        const fileContents = readFileSync(filePath, 'utf8')

        for (const query of parseNamedQueries(fileContents, fileName)) {
            if (queries.has(query.name)) {
                throw new Error(`Duplicate SQL query name "${query.name}" in ${fileName}`)
            }

            queries.set(query.name, query.sql)
        }
    }

    return queries
}

function parseNamedQueries(fileContents: string, fileName: string): NamedQuery[] {
    const markers = Array.from(fileContents.matchAll(queryNamePattern))
    if (markers.length === 0) {
        throw new Error(`No SQL query names found in ${fileName}`)
    }

    return markers.map((marker, index) => {
        const name = marker[1]
        if (name == null) {
            throw new Error(`Invalid SQL query name marker in ${fileName}`)
        }

        const sqlStart = marker.index + marker[0].length
        const nextMarker = markers[index + 1]
        const sqlEnd = nextMarker == null ? fileContents.length : nextMarker.index
        const sql = fileContents.slice(sqlStart, sqlEnd).trim()

        if (sql === '') {
            throw new Error(`SQL query "${name}" in ${fileName} is empty`)
        }

        return { name, sql }
    })
}
