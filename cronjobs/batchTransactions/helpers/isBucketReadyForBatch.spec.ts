import { expect } from 'chai'
import { isBucketReadyForBatch } from './isBucketReadyForBatch'
import * as constants from '../../../constants'
import Sinon from 'sinon'
import { psbt1, psbt2, psbt3 } from '../../../test/data/psbtData'
import { db } from '../../../src/utils/db'
import { KEYS } from '../../../src/utils/db/keys'
describe('isBucketReadyForBatch', () => {
  before(() => {
    Sinon.stub(constants, 'BATCH_SIZE_THRESHOLD').get(() => 2)
  })
  after(() => {
    Sinon.restore()
  })
  it('returns true if the size of the bucket is equal or bigger than the threshold', async () => {
    expect(await isBucketReadyForBatch([psbt1, psbt2], 1)).to.be.true
    expect(await isBucketReadyForBatch([psbt1, psbt2, psbt3], 1)).to.be.true
  })
  it('returns true if time threshold has been reached', async () => {
    expect(await isBucketReadyForBatch([psbt1], 1)).to.be.true
  })
  it('returns false if the size of the bucket less than thethreshold and time threshold has not been reached', async () => {
    await db.transaction(async (client) => {
      await client.set(KEYS.BUCKET.EXPIRATION + '1', true, 1000)
    })
    expect(await isBucketReadyForBatch([psbt1], 1)).to.be.false
    expect(await isBucketReadyForBatch([], 1)).to.be.false
  })
})
