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

    expect(await db.smembers(KEYS.TRANSACTION.PENDING)).to.deep.equal([
      '7da6541e8985385e374c442ebea375c071de499994f25e6e6623432eb6a4aef0',
      'e74f64cafeeca29e7981a59cb3e2a17ed698237d6c68329d51a4face9d01aff9',
      'd28ca6517dbd7dd991ac217f6be9b6f1ffe61f9a8efd194a2008d5ff6910747a',
      'c1f8a19f732ef5f7c60029d4894b46068d0c9ed8dbf8d4111e9e5c3f44cd35f0',
      'f275bc6102f561f69a13f14abebb795877c6a34e1e0314cd31c22a18a751f029',
      'a4ac1bc8c1ab181911e1c63fe7a379c8dd8cc72b32cf06fcea3c6819ce781cf2',
      '78e361980cc493633f2f7cf1015a1940d2f5fd53b966fa2f89e6a7cf0118cb3c',
      '15bedc190486b31384b2a2f6e5092ee430de55fe156d923828d69d70cd55c762',
      '7480668e7d5d23e4a39f5bde00cf86843680dcd83c02c68cd44b69b461bb0f6e',
      '8cce56aec1150339587ab7a7008d51c90d5d47fdf0ab6788d0518e1cdf51f3a1',
    ])
  })
})
