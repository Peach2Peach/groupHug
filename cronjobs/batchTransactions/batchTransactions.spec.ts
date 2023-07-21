import { Psbt, Transaction, networks } from 'bitcoinjs-lib'
import chai, { expect } from 'chai'
import Sinon, { SinonStub } from 'sinon'
import sinonChai from 'sinon-chai'
import * as constants from '../../constants'
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

  before(() => {
    Sinon.stub(constants, 'BATCH_SIZE_THRESHOLD').get(() => 10)
    Sinon.stub(constants, 'BATCH_TIME_THRESHOLD').get(() => 600)
  })
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
    Sinon.stub(getExtraPSBTData, 'getExtraPSBTData').resolves({ index: '1' })
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

    expect(await db.smembers(KEYS.TRANSACTION.PENDING)).to.deep.equal([
      '0a3ef13d9d3993880b58756bacc2d0cbd46a03b5d4ad894a39f87aab526b0627',
      'a4ac1bc8c1ab181911e1c63fe7a379c8dd8cc72b32cf06fcea3c6819ce781cf2',
      '8c563459ba3ac30eb323b5f79f61a43123a2569ba8ad5d693a0a5ea0d2826e74',
      'e74f64cafeeca29e7981a59cb3e2a17ed698237d6c68329d51a4face9d01aff9',
      'e16fa6bdbd5d824f46dd70be0eb2472dee38c2b08d056a75295ec5ffe5b63421',
      '71c8cabbcbd9bbf22a5d089910896c18c627e350e87f87c2dbb9b79da38f6014',
      '42b4136360520a54a32471c0a5fefba287df36f81c302e40388e4d817588cb28',
      '64613cb789906145113b5c52f15a46ebd3ef0842624630d0d45fbaaa05bc03eb',
      '5a53c4850df0654815ad3dbb24c32d84106fef942b08770591a6bed3da5ef274',
      'c1f8a19f732ef5f7c60029d4894b46068d0c9ed8dbf8d4111e9e5c3f44cd35f0',
      '15bedc190486b31384b2a2f6e5092ee430de55fe156d923828d69d70cd55c762',
    ])
  })
})
