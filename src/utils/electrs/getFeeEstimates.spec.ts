import { expect } from 'chai'
import Sinon from 'sinon'
import { BLOCKEXPLORERURL } from '../../../constants'
import { feeEstimates, rawFeeEstimates } from '../../../test/data/electrsData'
import { getFetchResponse } from '../../../test/unit/helpers/getFetchResponse'
import { fetchStub } from '../../../test/unit/hooks'
import { getFeeEstimates } from './getFeeEstimates'

describe('getFeeEstimates', () => {
  afterEach(() => {
    Sinon.restore()
  })

  it('should call fetch with url and return fee recommendation rounded', async () => {
    fetchStub
      .withArgs(`${BLOCKEXPLORERURL}/fee-estimates`)
      .resolves(getFetchResponse(rawFeeEstimates))

    const result = await getFeeEstimates()
    expect(result.getValue()).to.deep.equal(feeEstimates)
  })

  it('should handle errors', async () => {
    const errorMessage = new Error('error message')

    fetchStub
      .withArgs(`${BLOCKEXPLORERURL}/fee-estimates`)
      .rejects(errorMessage)

    const result = await getFeeEstimates()
    expect(result.getError()).to.deep.equals({
      error: 'INTERNAL_SERVER_ERROR',
      message: errorMessage,
    })
  })
})
