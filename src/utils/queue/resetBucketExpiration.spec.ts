import { expect } from 'chai'
import { db } from '../db'
import { KEYS } from '../db/keys'
import { resetBucketExpiration } from './resetBucketExpiration'
import { BATCH_TIME_THRESHOLD } from '../../../constants'

describe('resetBucketExpiration', () => {
  it('deletes psbt data', async () => {
    expect(await db.client.exists(KEYS.BUCKET.EXPIRATION + '0')).to.equal(0)
    await resetBucketExpiration(0)
    expect(await db.client.exists(KEYS.BUCKET.EXPIRATION + '0')).to.equal(1)
    expect(await db.client.ttl(KEYS.BUCKET.EXPIRATION + '0')).to.equal(
      BATCH_TIME_THRESHOLD,
    )
  })
})
