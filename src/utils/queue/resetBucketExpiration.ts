import { BATCH_TIME_THRESHOLD, MSINS } from '../../../constants'
import { db } from '../db'
import { SubClient } from '../db/SubClient'
import { KEYS } from '../db/keys'

export const resetBucketExpirationWithClient = async (client: SubClient) => {
  await client.set(KEYS.BUCKET.EXPIRATION, 'true', BATCH_TIME_THRESHOLD * MSINS)
}
export const resetBucketExpiration = () => db.transaction((client) => resetBucketExpirationWithClient(client))
