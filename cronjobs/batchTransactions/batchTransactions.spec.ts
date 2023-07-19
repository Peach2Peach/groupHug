import { Psbt } from 'bitcoinjs-lib'
import chai, { expect } from 'chai'
import Sinon, { SinonStub } from 'sinon'
import { db } from '../../src/utils/db'
import * as getFeeEstimates from '../../src/utils/electrs/getFeeEstimates'
import { addPSBTToQueueWithClient } from '../../src/utils/queue'
import { getError, getResult } from '../../src/utils/result'
import { feeEstimates } from '../../test/data/electrsData'
import { batchQueue } from '../../test/data/psbtData'
import { batchTransactions } from './batchTransactions'
import * as constants from '../../constants'
import * as batchBucket from './batchBucket'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('batchTransactions', () => {
  let batchBucketStub: SinonStub
  const psbts = batchQueue.map(({ psbt }) => Psbt.fromBase64(psbt))
  before(() => {
    Sinon.stub(constants, 'BATCH_SIZE_THRESHOLD').get(() => 10)
    Sinon.stub(constants, 'BATCH_TIME_THRESHOLD').get(() => 600)
  })
  beforeEach(async () => {
    batchBucketStub = Sinon.stub(batchBucket, 'batchBucket')
    await db.transaction(async (client) => {
      await Promise.all(
        batchQueue.map(({ feeRate }, i) =>
          addPSBTToQueueWithClient(client, psbts[i], feeRate),
        ),
      )
    })
  })
  after(() => {
    Sinon.restore()
  })
  it('abort if fees estimates cannot be fetched', async () => {
    Sinon.stub(getFeeEstimates, 'getFeeEstimates').resolves(
      getError({ error: 'INTERNAL_SERVER_ERROR' }),
    )
    expect(await batchTransactions()).to.be.false
  })
  it('process return true on success', async () => {
    Sinon.stub(getFeeEstimates, 'getFeeEstimates').resolves(
      getResult(feeEstimates),
    )
    expect(await batchTransactions()).to.be.true
  })
  it('calls batch buckets with correct psbts', async () => {
    Sinon.stub(getFeeEstimates, 'getFeeEstimates').resolves(
      getResult(feeEstimates),
    )
    await batchTransactions()

    // psbt data is sorted by fee rate, we check if each psbt landed in the right bucket
    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(80, 100))
    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(68, 80))
    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(61, 68))
    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(58, 61))
    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(51, 58))
    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(48, 51))
    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(45, 48))
    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(33, 45))
    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(19, 33))
    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(9, 19))
    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(0, 9))
  })
})
