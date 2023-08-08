import { expect } from 'chai'
import blockExplorerData from '../../test/data/blockExplorerData.json'
import { mockGetTx } from '../../test/unit/helpers/mockGetTx'
import { mockGetTxError } from '../../test/unit/helpers/mockGetTxError'
import { getConfirmations } from './getConfirmations'

describe('getConfirmations', () => {
  const txId = 'txId'
  const blockHeight = blockExplorerData.tx.status.block_height + 4

  it('should return 0 confirmations if tx could not be fetched', async () => {
    mockGetTxError(txId)
    expect(await getConfirmations(blockHeight)(txId)).to.deep.equal({
      txId,
      confirmations: 0,
    })
  })
  it('should return 0 confirmations for txId in mempool', async () => {
    mockGetTx(txId, blockExplorerData.txMempool)
    expect(await getConfirmations(blockHeight)(txId)).to.deep.equal({
      txId,
      confirmations: 0,
    })
  })
  it('should return confirmations for txId', async () => {
    mockGetTx(txId, blockExplorerData.tx)
    expect(await getConfirmations(blockHeight)(txId)).to.deep.equal({
      txId,
      confirmations: 4,
    })
  })
})
