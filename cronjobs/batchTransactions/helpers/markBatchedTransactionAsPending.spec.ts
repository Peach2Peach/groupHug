import { Psbt, networks } from 'bitcoinjs-lib'
import { expect } from 'chai'
import { db } from '../../../src/utils/db'
import { KEYS } from '../../../src/utils/db/keys'
import { addPSBTToQueueWithClient } from '../../../src/utils/queue'
import { batchQueue } from '../../../test/data/psbtData'
import { markBatchedTransactionAsPending } from './markBatchedTransactionAsPending'

describe('markBatchedTransactionAsPending', () => {
  const psbts = batchQueue.slice(0, 3).map(({ feeRate, psbt }) => ({
    feeRate,
    psbt: Psbt.fromBase64(psbt, { network: networks.regtest }),
  }))
  const txId = 'txId'

  beforeEach(async () => {
    await db.transaction(async (client) => {
      await Promise.all(
        psbts.map(({ feeRate, psbt }) =>
          addPSBTToQueueWithClient(client, psbt, feeRate),
        ),
      )
    })
  })
  it('moves psbts from pending queue to batch', async () => {
    expect(await db.zcard(KEYS.PSBT.QUEUE)).to.equal(3)
    await markBatchedTransactionAsPending(psbts, txId)
    expect(await db.zcard(KEYS.PSBT.QUEUE)).to.equal(0)
    expect(await db.zcard(KEYS.BATCH + txId)).to.equal(3)
    expect(await db.zrange(KEYS.BATCH + txId)).to.deep.equal(
      batchQueue.slice(0, 3).map(({ psbt }) => psbt),
    )
  })
  it('adds tx id to pending queue', async () => {
    await markBatchedTransactionAsPending(psbts, txId)
    expect(await db.sismember(KEYS.TRANSACTION.PENDING, txId)).to.be.true
  })
})
