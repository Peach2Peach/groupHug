import chai, { expect } from 'chai'
import Sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { BLOCKEXPLORERURL } from '../../constants'
import {
  addPendingTransaction,
  getConfirmedTransactions,
  getPendingTransactions,
} from '../../src/utils/batch'
import blockExplorerData from '../../test/data/blockExplorerData.json'
import { getFetchResponse } from '../../test/unit/helpers/getFetchResponse'
import { mockGetTx } from '../../test/unit/helpers/mockGetTx'
import { fetchStub } from '../../test/unit/hooks'
import { checkTransactionStatus } from './checkTransactionStatus'
import { logger } from './logger'

chai.use(sinonChai)

describe('checkTransactionStatus', () => {
  const blockHeight = blockExplorerData.tx.status.block_height + 6

  beforeEach(() => {
    fetchStub
      .withArgs(`${BLOCKEXPLORERURL}/blocks/tip/height`)
      .resolves(getFetchResponse(blockHeight))
  })

  it('should skip execution if block height cannot be determined', async () => {
    const errorStub = Sinon.stub(logger, 'error')

    fetchStub
      .withArgs(`${BLOCKEXPLORERURL}/blocks/tip/height`)
      .rejects('INTERNAL_SERVER_ERROR')
    expect(await checkTransactionStatus()).to.be.false
    expect(errorStub).to.have.been.calledWith([
      'Couldn\'t determine block height, skipping...',
    ])
  })
  it('should skip execution no pending transactions are in queue', async () => {
    const infoStub = Sinon.stub(logger, 'info')

    expect(await checkTransactionStatus()).to.be.true
    expect(infoStub).to.have.been.calledWith([
      'No transactions to check, skipping...',
    ])
  })
  it('should mark tx as confirmed that have at least 6 confirmations', async () => {
    const txIds = ['txId1', 'txId2', 'txId3', 'txId4']
    await Promise.all(txIds.map(addPendingTransaction))

    mockGetTx(txIds[0], blockExplorerData.tx)
    mockGetTx(txIds[1], {
      ...blockExplorerData.tx,
      status: { ...blockExplorerData.tx.status, block_height: blockHeight - 4 },
    })
    mockGetTx(txIds[2], blockExplorerData.tx)
    mockGetTx(txIds[3], blockExplorerData.txMempool)

    expect(await checkTransactionStatus()).to.be.true
    const [pending, confirmed] = await Promise.all([
      await getPendingTransactions(),
      await getConfirmedTransactions(),
    ])
    expect(pending).to.include('txId2')
    expect(pending).to.include('txId4')
    expect(confirmed).to.include('txId1')
    expect(confirmed).to.include('txId3')
  })
})
