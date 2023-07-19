import { expect } from 'chai'
import { hasBucketReachedTimeThreshold } from './hasBucketReachedTimeThreshold'
import { db } from '../../../src/utils/db'
import { KEYS } from '../../../src/utils/db/keys'
describe('hasBucketReachedTimeThreshold', () => {
  it('returns true if the bucket index cannot be found in the database', async () => {
    expect(await hasBucketReachedTimeThreshold(1)).to.be.true
  })
  it('returns true if the bucket index can be found in the database', async () => {
    await db.transaction(async (client) => {
      await client.set(KEYS.BUCKET.EXPIRATION + '1', true, 1000)
    })
    expect(await hasBucketReachedTimeThreshold(1)).to.be.false
  })
})
