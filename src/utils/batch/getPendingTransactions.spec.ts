import { expect } from 'chai'
import { addPendingTransaction } from './addPendingTransaction'
import { getPendingTransactions } from './getPendingTransactions'

describe('getPendingTransactions', () => {
  const txId = 'txId'
  it('adds pending transaction from set', async () => {
    await addPendingTransaction(txId)
    expect(await getPendingTransactions()).to.deep.equal([txId])
  })
})
