import { expect } from 'chai'
import { db } from '../db'
import { KEYS } from '../db/keys'
import { resetAllBucketExpirations } from './resetAllBucketExpirations'
import { BATCH_TIME_THRESHOLD } from '../../../constants'

describe('resetAllBucketExpirations', () => {
  const buckets = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  it('resets expiration time for all buckets', async () => {
    let exists = await Promise.all(
      buckets.map((i) => db.client.exists(KEYS.BUCKET.EXPIRATION + i)),
    )
    expect(exists).to.deep.equal([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    await resetAllBucketExpirations()
    exists = await Promise.all(
      buckets.map((i) => db.client.exists(KEYS.BUCKET.EXPIRATION + i)),
    )
    const ttls = await Promise.all(
      buckets.map((i) => db.client.ttl(KEYS.BUCKET.EXPIRATION + i)),
    )
    expect(exists).to.deep.equal([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
    expect(ttls).to.deep.equal([
      BATCH_TIME_THRESHOLD,
      BATCH_TIME_THRESHOLD,
      BATCH_TIME_THRESHOLD,
      BATCH_TIME_THRESHOLD,
      BATCH_TIME_THRESHOLD,
      BATCH_TIME_THRESHOLD,
      BATCH_TIME_THRESHOLD,
      BATCH_TIME_THRESHOLD,
      BATCH_TIME_THRESHOLD,
      BATCH_TIME_THRESHOLD,
      BATCH_TIME_THRESHOLD,
    ])
  })
})
