import { expect } from 'chai'
import Sinon from 'sinon'
import { feeEstimates } from '../../../test/data/electrsData'
import * as getFeeEstimates from '../electrs/getFeeEstimates'
import { getResult } from '../result'
import { getBucketIndexByFeeRate } from './getBucketIndexByFeeRate'

describe('getBucketIndexByFeeRate', () => {
  it('returns bucket index for feeRate', async () => {
    Sinon.stub(getFeeEstimates, 'getFeeEstimates').resolves(
      getResult(feeEstimates),
    )
    expect(await getBucketIndexByFeeRate(2)).to.equal(9)
    expect(await getBucketIndexByFeeRate(feeEstimates.fastestFee)).to.equal(1)
    expect(await getBucketIndexByFeeRate(feeEstimates.fastestFee * 2)).to.equal(
      0,
    )
  })
})
