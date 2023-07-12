import { expect } from 'chai'
import { db } from '../db'
import { KEYS } from '../db/keys'
import { addPendingTransaction } from './addPendingTransaction'

describe('addPendingTransaction', () => {
  const txId = 'txId'
  it('adds pending transaction from set', async () => {
    await addPendingTransaction(txId)
    expect(await db.smembers(KEYS.TRANSACTION.PENDING)).to.deep.equal([txId])
  })
})
