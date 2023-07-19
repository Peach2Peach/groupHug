import { Psbt, PsbtTxInput } from 'bitcoinjs-lib'
import chai, { expect } from 'chai'
import Sinon, { SinonStub } from 'sinon'
import sinonChai from 'sinon-chai'
import blockExplorerData from '../../test/data/blockExplorerData.json'
import { batchQueue } from '../../test/data/psbtData'
import { getUnspentPsbts } from './getUnspentPsbts'
import * as getTxAndUTXOForInput from './helpers/getTxAndUTXOForInput'
import * as inputIsUnspent from './helpers/inputIsUnspent'
import {
  addPSBTToQueueWithClient,
  getPSBTsFromQueue,
} from '../../src/utils/queue'
import { db } from '../../src/utils/db'

chai.use(sinonChai)

describe('getUnspentPsbts', () => {
  let getTxAndUTXOForInputStub: SinonStub
  let inputIsUnspentStub: SinonStub
  const psbts = batchQueue.map(({ psbt }) => Psbt.fromBase64(psbt))
  const bucket = psbts.slice(0, 10)

  const spiceTxWithPSBTInput = (input: PsbtTxInput): Transaction => ({
    ...blockExplorerData.tx,
    txid: input.hash.toString('hex'),
  })
  const spiceUTXOWithPSBTInput = (input: PsbtTxInput): UTXO[] =>
    blockExplorerData.utxo.map((utxo) => ({
      ...utxo,
      txid: input.hash.toString('hex'),
    }))

  const fakeGetTxAndUTXOForInput = (input: PsbtTxInput) =>
    Promise.resolve({
      tx: spiceTxWithPSBTInput(input),
      utxo: spiceUTXOWithPSBTInput(input),
    })

  beforeEach(async () => {
    getTxAndUTXOForInputStub = Sinon.stub(
      getTxAndUTXOForInput,
      'getTxAndUTXOForInput',
    ).callsFake(fakeGetTxAndUTXOForInput)
    inputIsUnspentStub = Sinon.stub(
      inputIsUnspent,
      'inputIsUnspent',
    ).callThrough()

    await db.transaction(async (client) => {
      await Promise.all(
        bucket.map((psbt) => addPSBTToQueueWithClient(client, psbt, 1)),
      )
    })
  })
  after(() => {
    Sinon.restore()
  })
  it('checks whether each input has been spent', async () => {
    const filtered = await getUnspentPsbts(bucket)

    expect(filtered).to.deep.equal(bucket)

    for (const psbt of bucket) {
      expect(inputIsUnspentStub).to.have.been.calledWith(
        psbt.txInputs[0],
        spiceUTXOWithPSBTInput(psbt.txInputs[0]),
      )
    }
  })
  it('removes PSBT if it has been spent', async () => {
    expect((await getPSBTsFromQueue()).length).to.equal(10)

    getTxAndUTXOForInputStub.callsFake(() => ({
      tx: blockExplorerData.tx,
      utxo: [],
    }))
    const filtered = await getUnspentPsbts(bucket)

    expect(filtered).to.deep.equal([])
    expect(await getPSBTsFromQueue()).to.deep.equal([])
  })
})
