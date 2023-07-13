import { Psbt } from 'bitcoinjs-lib'
import { expect } from 'chai'
import Sinon from 'sinon'
import { db } from '../../src/utils/db'
import * as getFeeEstimates from '../../src/utils/electrs/getFeeEstimates'
import { addPSBTToQueueWithClient } from '../../src/utils/queue'
import { getResult } from '../../src/utils/result'
import { feeEstimates } from '../../test/data/electrsData'
import { batchQueue } from '../../test/data/psbtData'
import { batchTransactions } from './batchTransactions'
import * as constants from '../../constants'

describe('batchTransactions', () => {
  before(() => {
    Sinon.stub(constants, 'BATCH_SIZE_THRESHOLD').get(() => 10)
    Sinon.stub(constants, 'BATCH_TIME_THRESHOLD').get(() => 600)
  })
  beforeEach(async () => {
    await db.transaction(async (client) => {
      await Promise.all(
        batchQueue.map(({ psbt, feeRate }) =>
          addPSBTToQueueWithClient(client, Psbt.fromBase64(psbt), feeRate),
        ),
      )
    })
  })
  it('abort if fees estimates cannot be fetched', async () => {
    expect(await batchTransactions()).to.be.false
  })
  it('process return true on success', async () => {
    Sinon.stub(getFeeEstimates, 'getFeeEstimates').resolves(
      getResult(feeEstimates),
    )
    expect(await batchTransactions()).to.be.true
  })
})
