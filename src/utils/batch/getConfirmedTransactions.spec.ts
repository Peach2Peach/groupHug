import { expect } from 'chai'
import { addConfirmedTransaction } from './addConfirmedTransaction'
import { getConfirmedTransactions } from './getConfirmedTransactions'

describe('getConfirmedTransactions', () => {
  const txId = 'txId'
  it('adds pending transaction from set', async () => {
    await addConfirmedTransaction(txId)
    expect(await getConfirmedTransactions()).to.deep.equal([txId])
  })
})
