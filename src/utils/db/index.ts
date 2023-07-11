import { RedisClientOptions } from 'redis'
import { DB_AUTH, DB_HOST, DB_PORT } from '../../../constants'
import { DatabaseClient } from './DatabaseClient'

export const getDefaultOptions = (opt = {}): RedisClientOptions => ({
  url: `redis://${DB_HOST}:${DB_PORT}`,
  password: DB_AUTH,
  database: 0,
  ...opt,
})

export let db: DatabaseClient

export const initDatabase = (opt?: RedisClientOptions): Promise<void> => {
  const dbCount = 4
  db = new DatabaseClient(
    getDefaultOptions(
      opt || {
        database: 0,
      },
    ),
  )
  return new Promise((resolve) => {
    let done = 0

    const checkReady = () => {
      done += 1
      if (done === dbCount) resolve()
    }

    db.client.on('ready', checkReady)
  })
}

export const setClients = (dbClient: DatabaseClient) => {
  db = dbClient
}

export const disconnectDatabases = async () => {
  await db.quit()
}
