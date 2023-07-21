import { BATCH_TIME_THRESHOLD, MSINS } from '../../../constants'
import { db } from '../db'
import { SubClient } from '../db/SubClient'
import { KEYS } from '../db/keys'

export const resetBucketExpirationWithClient = async (client: SubClient, index: number) => {
  await client.set(KEYS.BUCKET.EXPIRATION + String(index), 'true', BATCH_TIME_THRESHOLD * MSINS)
}
export const resetBucketExpiration = async (index: number) =>
  db.transaction((client) => resetBucketExpirationWithClient(client, index))
