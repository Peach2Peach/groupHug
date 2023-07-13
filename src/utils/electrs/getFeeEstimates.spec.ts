import { expect } from 'chai'
import Sinon from 'sinon'
import { BLOCKEXPLORERURL } from '../../../constants'
import * as fetch from '../../../middleware/fetch'
import { getFeeEstimates } from './getFeeEstimates'
import { Response } from 'node-fetch'
import { feeEstimates, rawFeeEstimates } from '../../../test/data/electrsData'

describe('getFeeEstimates', () => {
  afterEach(() => {
    Sinon.restore()
  })

  it('should call fetch with url and return fee recommendation rounded', async () => {
    Sinon.stub(fetch, 'default')
      .withArgs(`${BLOCKEXPLORERURL}/fee-estimates`)
      .resolves({
        json: () => Promise.resolve(rawFeeEstimates),
        status: 200,
      } as Response)

    const result = await getFeeEstimates()
    expect(result.getValue()).to.deep.equal(feeEstimates)
  })

  it('should handle errors', async () => {
    const errorMessage = new Error('error message')

    Sinon.stub(fetch, 'default')
      .withArgs(`${BLOCKEXPLORERURL}/fee-estimates`)
      .rejects(errorMessage)

    const result = await getFeeEstimates()
    expect(result.getError()).to.deep.equals({
      error: 'INTERNAL_SERVER_ERROR',
      message: errorMessage,
    })
  })
})
