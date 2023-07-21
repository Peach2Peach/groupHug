import { Psbt, PsbtTxInput, networks } from 'bitcoinjs-lib'
import chai, { expect } from 'chai'
import Sinon, { SinonStub } from 'sinon'
import sinonChai from 'sinon-chai'
import blockExplorerData from '../../../test/data/blockExplorerData.json'
import { batchQueue } from '../../../test/data/psbtData'
import { getUnspentPsbts } from './getUnspentPsbts'
import * as getTxAndUTXOForInput from './getTxAndUTXOForInput'
import * as inputIsUnspent from './inputIsUnspent'
import {
  addPSBTToQueueWithClient,
  getPSBTsFromQueue,
} from '../../../src/utils/queue'
import { db } from '../../../src/utils/db'
import { spiceUTXOWithPSBTInput } from '../../../test/unit/helpers/spiceUTXOWithPSBTInput'
import { spiceTxWithPSBTInput } from '../../../test/unit/helpers/spiceTxWithPSBTInput'

chai.use(sinonChai)

describe('getUnspentPsbts', () => {
  let getTxAndUTXOForInputStub: SinonStub
  let inputIsUnspentStub: SinonStub
  const psbts = batchQueue.map(({ psbt }) =>
    Psbt.fromBase64(psbt, { network: networks.regtest }),
  )
  const bucket = psbts.slice(0, 10)

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

    expect(filtered.psbts).to.deep.equal(bucket)
    expect(filtered.utxos).to.deep.equal(
      bucket.map((psbt) => psbt.txInputs[0]).map(spiceUTXOWithPSBTInput),
    )

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

    expect(filtered.psbts).to.deep.equal([])
    expect(filtered.utxos).to.deep.equal([])
    expect(await getPSBTsFromQueue()).to.deep.equal([])
  })
})
