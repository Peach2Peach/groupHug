import { expect } from 'chai'
import { db } from '../db'
import { KEYS } from '../db/keys'
import { saveBucketStatus } from './saveBucketStatus'

describe('saveBucketStatus', () => {
  it('resets expiration for bucket at index', async () => {
    expect(await db.client.exists(KEYS.BUCKET.STATUS + '0')).to.equal(0)
    await saveBucketStatus(0, 10, 20)
    expect(await db.hgetall(KEYS.BUCKET.STATUS + '0')).to.deep.equal({
      participants: '10',
      maxParticipants: '20',
    })
  })
})
