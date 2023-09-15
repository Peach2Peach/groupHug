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
      '0b5e372a4a19bcfb6f963df8cb2ff661f7682fe3fa37cae8ae67a6285488f1b5',
      '2f96365ee5207328a0bce53e3ea17a503a30b716055061730acf163647089af9',
      '5c3deee566e397bccb825edfa92718ccafc2874c0b13614f9f525ca2603ddd7e',
      '80a3d160e87a990abaf86de9aa56c7fe54c071725d67c99bdfe134b92622cd34',
      'c7b18614308eaba7c6424d787574a3e0d5841e211d69c9737eb86a855ca22a79',
      'e2768147074e4e435ab2b9b9ab9e063f5c9b11ae11cbcf11a2e9d7ec54df8218',
      'eb2bdabaf0917eead32be567143c33e3b34a5e01c7488ea7b6098378137a7cfa',
      'ef1cc758ee289ea386aecc55a38a3e594ecd5cb559a0394798e0e4ee995102af',
      'ef939a8608090bc4d20ebee5150f8ee958bcd9102c2a124b8fd083223fd9eb2e',
      'f88fbd51450b8ea5b17f3eb521a5ca5c4227abfde871399050c1c8287e4f79ef',
    ])
  })
})
