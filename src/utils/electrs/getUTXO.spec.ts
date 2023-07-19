import { expect } from 'chai'
import { describe, it } from 'mocha'
import Sinon from 'sinon'
import { BLOCKEXPLORERURL } from '../../../constants'
import blockExplorerData from '../../../test/data/blockExplorerData.json'
import { mockGetUTXO } from '../../../test/unit/helpers/mockGetUTXO'
import { mockGetUTXOError } from '../../../test/unit/helpers/mockGetUTXOError'
import { fetchStub } from '../../../test/unit/hooks'
import { getUTXO } from './getUTXO'

describe('getUTXO', () => {
  const address = 'bc1qr2eh5apj9e6mm6mlrzmpl6gwztq6h800ytc2p7'

  afterEach(() => {
    Sinon.restore()
  })
  it('fetches utxo details', async () => {
    mockGetUTXO(address, blockExplorerData.utxo)
    const result = await getUTXO(address)
    expect(result.getValue()).to.deep.equal(blockExplorerData.utxo)
  })
  it('handles response errors', async () => {
    mockGetUTXOError(address, 'Transaction not found', 404)
    const result = await getUTXO(address)
    expect(result.getError()).to.deep.equal({ error: 'INTERNAL_SERVER_ERROR' })
  })
  it('handles unexpected errors', async () => {
    const error = new Error('error')
    fetchStub
      .withArgs(`${BLOCKEXPLORERURL}/address/${address}/utxo`)
      .rejects(error)
    const result = await getUTXO(address)
    expect(result.getError()).to.deep.equal({
      error: 'INTERNAL_SERVER_ERROR',
      message: error,
    })
  })
})
