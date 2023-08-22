import { Psbt, Transaction, networks } from 'bitcoinjs-lib'
import chai, { expect } from 'chai'
import Sinon, { SinonStub } from 'sinon'
import sinonChai from 'sinon-chai'
import { db } from '../../src/utils/db'
import { KEYS } from '../../src/utils/db/keys'
import * as getFeeEstimates from '../../src/utils/electrs/getFeeEstimates'
import * as postTx from '../../src/utils/electrs/postTx'
import { addPSBTToQueueWithClient } from '../../src/utils/queue'
import * as getExtraPSBTData from '../../src/utils/queue/getExtraPSBTData'
import { getError, getResult } from '../../src/utils/result'
import { feeEstimates } from '../../test/data/electrsData'
import { batchQueue } from '../../test/data/psbtData'
import { spiceUTXOWithPSBT } from '../../test/unit/helpers/spiceUTXOWithPSBT'
import * as batchBucket from './batchBucket'
import { batchTransactions } from './batchTransactions'
import * as getUnspentPsbts from './helpers/getUnspentPsbts'

chai.use(sinonChai)

describe('batchTransactions', () => {
  let postTxStub: SinonStub
  let batchBucketStub: SinonStub
  const psbts = batchQueue.map(({ feeRate, psbt }) => ({
    feeRate,
    psbt: Psbt.fromBase64(psbt, { network: networks.regtest }),
  }))

  beforeEach(async () => {
    batchBucketStub = Sinon.stub(batchBucket, 'batchBucket').callThrough()
    postTxStub = Sinon.stub(postTx, 'postTx').callsFake((hex) =>
      Promise.resolve(getResult(Transaction.fromHex(hex).getId())),
    )
    Sinon.stub(getUnspentPsbts, 'getUnspentPsbts').callsFake((_psbts: Psbt[]) =>
      Promise.resolve({
        psbts: _psbts,
        utxos: _psbts.map((psbt) => spiceUTXOWithPSBT(psbt)),
      }),
    )
    Sinon.stub(getExtraPSBTData, 'getExtraPSBTData').resolves({
      index: 1,
      psbt: '',
      revocationToken: '',
    })
    await db.transaction(async (client) => {
      await Promise.all(
        psbts.map(({ psbt, feeRate }) =>
          addPSBTToQueueWithClient(client, psbt, feeRate),
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
  it('handles post tx errors', async () => {
    Sinon.stub(getFeeEstimates, 'getFeeEstimates').resolves(
      getResult(feeEstimates),
    )
    postTxStub.resolves(getError({ error: 'INTERNAL_SERVER_ERROR' }))
    expect(await batchTransactions()).to.be.false
  })
  it('handles batchBucket errors', async () => {
    Sinon.stub(getFeeEstimates, 'getFeeEstimates').resolves(
      getResult(feeEstimates),
    )
    batchBucketStub.resolves(getError('No psbts left to spend'))
    expect(await batchTransactions()).to.be.false
  })
  it('calls batch buckets with correct psbts, post transactions and return true on success', async () => {
    Sinon.stub(getFeeEstimates, 'getFeeEstimates').resolves(
      getResult(feeEstimates),
    )
    expect(await batchTransactions()).to.be.true

    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(80, 100))
    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(68, 80))
    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(61, 68))
    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(54, 61))
    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(51, 54))
    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(47, 51))
    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(37, 47))
    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(25, 37))
    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(9, 25))
    expect(batchBucketStub).to.have.been.calledWith(psbts.slice(0, 9))

    const pending = await db.smembers(KEYS.TRANSACTION.PENDING)
    expect(pending.sort()).to.deep.equal([
      '0a3023219e47a895625095caed0142e1f3645b223d92c56904a6bf8844bf3256',
      '138463bd5dae4c0ffb32d4edf031ac11a9b69ef675aa6ec8186a7e9611cc0e34',
      '18e68c4fbb4c940979ce344799ee5b8c4bdb85f0193b65278543db560e9a921a',
      '3fbcdab2c6d4afbec070f67e34a1d60eccb1bc9ee3cea721f1b9f9f43ad3f93c',
      '4d99653ff35183ace4ebb1cf0bcd5518442209a0ffc958978b2e438a09c8041a',
      'bff771612b9472ac4862a35205d20ee062f3407c69d536be1eb90528b1b71b9d',
      'd56afcc703e2dc6503741cf66a8d2d6593d5f60117bee4837305adb913bf42c2',
      'dba71474bc75298cbbbb1c9a3e38a55b69e6c672b072e2e6ac969f4d291cde7b',
      'f5b123da9e38295e631c01d929aec638573726b6fd944dcb8aa4d742c28ca391',
      'f6036b6aa083103f0f5eb395efaad4e577f1504dd37bd519a5d4ff7ad6feadc3',
    ])
  })
})
