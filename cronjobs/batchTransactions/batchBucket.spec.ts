import { Psbt, networks } from 'bitcoinjs-lib'
import chai, { expect } from 'chai'
import Sinon, { SinonStub } from 'sinon'
import sinonChai from 'sinon-chai'
import { addPSBTToQueue } from '../../src/utils/queue'
import blockExplorerData from '../../test/data/blockExplorerData.json'
import { batchQueue } from '../../test/data/psbtData'
import { spiceUTXOWithPSBT } from '../../test/unit/helpers/spiceUTXOWithPSBT'
import { batchBucket } from './batchBucket'
import * as getUnspentPsbts from './helpers/getUnspentPsbts'

chai.use(sinonChai)

describe('batchBucket', () => {
  let getUnspentPsbtsStub: SinonStub
  const psbts = batchQueue.map(({ feeRate, psbt, index }) => ({
    feeRate,
    psbt: Psbt.fromBase64(psbt, { network: networks.regtest }),
    index,
  }))

  const bucket = psbts.slice(0, 10)
  beforeEach(async () => {
    getUnspentPsbtsStub = Sinon.stub(
      getUnspentPsbts,
      'getUnspentPsbts',
    ).callsFake((_psbts: Psbt[]) =>
      Promise.resolve({
        psbts: _psbts,
        utxos: _psbts.map((psbt) => spiceUTXOWithPSBT(psbt)),
      }),
    )

    await Promise.all(
      psbts
        .slice(0, 10)
        .map(({ psbt, feeRate, index }) =>
          addPSBTToQueue(psbt, feeRate, index),
        ),
    )
  })
  after(() => {
    Sinon.restore()
  })

  it('creates a batched transaction with all psbts and correct fee output', async () => {
    const finalTransaction = await batchBucket(bucket)

    expect(finalTransaction.ins.length).to.equal(10)
    expect(finalTransaction.outs.length).to.equal(11)
    expect(finalTransaction.outs[10].script.toString('hex')).to.equal(
      '0014c660079108cfbe1fe5278bc79eb1fee5afa9a201',
    )
    expect(finalTransaction.outs[10].value).to.equal(34482)
  })
})
