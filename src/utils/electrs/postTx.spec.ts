import { expect } from 'chai'
import Sinon from 'sinon'
import { BLOCKEXPLORERURL } from '../../../constants'
import { fetchStub } from '../../../test/unit/hooks'
import { postTx } from './postTx'
describe('postTx', () => {
  it('should return a Promise resolving to funding status when successful', async () => {
    const tx = 'mocktx'
    const response = {
      status: 200,
      text: Sinon.stub().resolves('mockStatus'),
    }
    fetchStub
      .withArgs(`${BLOCKEXPLORERURL}/tx`, Sinon.match.any)
      .resolves(response)

    const result = await postTx(tx)

    expect(result.isOk()).to.be.true
    expect(result.getValue()).to.equal('mockStatus')
  })

  it('should return a Promise with an error object when the response status is not 200', async () => {
    const tx = 'mocktx'
    const response = { status: 500 }
    fetchStub
      .withArgs(`${BLOCKEXPLORERURL}/tx`, Sinon.match.any)
      .resolves(response)

    const result = await postTx(tx)

    expect(result.isError()).to.be.true
    expect(result.getError()).to.deep.equal({ error: 'INTERNAL_SERVER_ERROR' })
  })

  it('should return a Promise with an error object when fetch throws an error', async () => {
    const tx = 'mocktx'
    const error = new Error('mockError')
    fetchStub.withArgs(`${BLOCKEXPLORERURL}/tx`, Sinon.match.any).rejects(error)

    const result = await postTx(tx)

    expect(result.isError()).to.be.true
    expect(result.getError()).to.deep.equal({
      error: 'INTERNAL_SERVER_ERROR',
      message: error,
    })
  })
})
