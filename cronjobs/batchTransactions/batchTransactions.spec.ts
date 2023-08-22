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
      '1af00511e4b474a9e790612081f547fe01323e4b0b0719c8f94c5b5743e6a99c',
      '2725a30a8bd2b8d47cb873c4518f7c3a85a5941d5d451d2698861d10e5947f73',
      '47e9a80ccbdc9c4be4b5cdbaa38bd16ac5122baf4e063896dfb6cfb9a19aab7c',
      '6663bf03e75ef54fe5c917d0158588ed5bb19c40b5c369227d05875d28825b93',
      '8d95fe7b2a63fedafc28c0a7f0fb93cc1acdde382bc7c701a7b59910cffeefd6',
      '9edc4ff26404251c1ca8557bff7a4892de0b49318fa46cd1c3d9f5297a540d12',
      'a855159cabf3922af1eeaebb1e8f43f83e717ba26211708858a7fd026e6db7dd',
      'ab2f52e7368a4f18905d3a1fd963664099454df1f298d6a65c3be766271f8629',
      'd96b10d19201f9297a3d7a1f1ee009f651ecb6d44aea91235f6ff07db15743a0',
      'e2299e44d11778ec8c3d83458a1bb30dc0f4dce2be1115b6c7b46a9ae822a545',
    ])
  })
})
