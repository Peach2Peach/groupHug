import { expect } from 'chai'
import { BATCH_TIME_THRESHOLD } from '../../../constants'
import { db } from '../db'
import { KEYS } from '../db/keys'
import { resetBucketExpiration } from './resetBucketExpiration'

describe('resetBucketExpiration', () => {
  it('resets expiration for bucket at index', async () => {
    expect(await db.client.exists(KEYS.BUCKET.EXPIRATION)).to.equal(0)
    await resetBucketExpiration()
    expect(await db.client.exists(KEYS.BUCKET.EXPIRATION)).to.equal(1)
    expect(await db.client.ttl(KEYS.BUCKET.EXPIRATION)).to.equal(
      BATCH_TIME_THRESHOLD,
    )
  })
})
