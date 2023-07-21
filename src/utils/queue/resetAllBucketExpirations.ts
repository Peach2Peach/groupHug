import { BUCKETS } from '../../../constants'
import { db } from '../db'
import { resetBucketExpirationWithClient } from './resetBucketExpiration'

export const resetAllBucketExpirations = async () => {
  const buckets: number[] = []
  for (let i = BUCKETS; i >= 0; i--) {
    buckets.push(i)
  }
  await db.transaction(async (client) => {
    await Promise.all(buckets.map((i) => resetBucketExpirationWithClient(client, i)))
  })
}
