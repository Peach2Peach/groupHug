import { expect } from 'chai'
import { getBucketStatus } from './getBucketStatus'
import { resetBucketExpiration } from './resetBucketExpiration'
import { saveBucketStatus } from './saveBucketStatus'

describe('getBucketStatus', () => {
  it('resets expiration for bucket at index', async () => {
    await Promise.all([
      saveBucketStatus({
        index: 0,
        participants: 10,
        maxParticipants: 20,
        feeRange: [1, 10],
      }),
      resetBucketExpiration(0),
    ])

    expect(await getBucketStatus(0)).to.deep.equal({
      participants: 10,
      maxParticipants: 20,
      timeRemaining: 600,
      feeRange: [1, 10],
      completed: false,
    })
  })
})
