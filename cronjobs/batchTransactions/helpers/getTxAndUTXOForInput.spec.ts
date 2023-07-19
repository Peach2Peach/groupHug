import { expect } from 'chai'
import { describe, it } from 'mocha'
import Sinon from 'sinon'
import { BLOCKEXPLORERURL } from '../../../constants'
import blockExplorerData from '../../../test/data/blockExplorerData.json'
import { psbt1 } from '../../../test/data/psbtData'
import { mockGetTx } from '../../../test/unit/helpers/mockGetTx'
import { mockGetUTXO } from '../../../test/unit/helpers/mockGetUTXO'
import { fetchStub } from '../../../test/unit/hooks'
import { getTxAndUTXOForInput } from './getTxAndUTXOForInput'

describe('getTxAndUTXOForInput', () => {
  const txId = psbt1.txInputs[0].hash.toString('hex')

  afterEach(() => {
    Sinon.restore()
  })
  it('fetches utxo details', async () => {
    mockGetTx(txId, blockExplorerData.tx)
    mockGetUTXO(
      blockExplorerData.tx.vout[0].scriptpubkey_address,
      blockExplorerData.utxo,
    )
    const result = await getTxAndUTXOForInput(psbt1.txInputs[0])
    expect(result).to.deep.equal({
      tx: blockExplorerData.tx,
      utxo: blockExplorerData.utxo,
    })
  })
  it('returns undefined if tx could not be retrueved', async () => {
    const error = new Error('error')
    fetchStub.withArgs(`${BLOCKEXPLORERURL}/tx/${txId}`).rejects(error)
    const result = await getTxAndUTXOForInput(psbt1.txInputs[0])
    expect(result).to.be.undefined
  })
})
