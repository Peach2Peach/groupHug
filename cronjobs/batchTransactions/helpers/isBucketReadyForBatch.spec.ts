import { expect } from 'chai'
import Sinon from 'sinon'
import * as constants from '../../../constants'
import { psbt1, psbt2, psbt3 } from '../../../test/data/psbtData'
import { isBucketReadyForBatch } from './isBucketReadyForBatch'
describe('isBucketReadyForBatch', () => {
  before(() => {
    Sinon.stub(constants, 'BATCH_SIZE_THRESHOLD').get(() => 2)
  })
  it('returns true if the size of the bucket is equal or bigger than the threshold', () => {
    expect(
      isBucketReadyForBatch([
        { feeRate: 1, psbt: psbt1 },
        { feeRate: 1, psbt: psbt2 },
      ]),
    ).to.be.true
    expect(
      isBucketReadyForBatch([
        { feeRate: 1, psbt: psbt1 },
        { feeRate: 1, psbt: psbt2 },
        { feeRate: 1, psbt: psbt3 },
      ]),
    ).to.be.true
  })

  it('returns false if the size of the bucket less than thethreshold', () => {
    expect(isBucketReadyForBatch([{ feeRate: 1, psbt: psbt1 }])).to.be.false
    expect(isBucketReadyForBatch([])).to.be.false
  })
})
