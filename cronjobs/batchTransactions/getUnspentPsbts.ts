import { Psbt } from 'bitcoinjs-lib'
import { db } from '../../src/utils/db'
import { removePSBTFromQueueWithClient } from '../../src/utils/queue'
import { getTxAndUTXOForInput, inputIsUnspent } from './helpers'

export const getUnspentPsbts = async (psbts: Psbt[]) => {
  const txAndUTXO = await Promise.all(psbts.map((psbt) => psbt.txInputs[0]).map(getTxAndUTXOForInput))
  const unspent = txAndUTXO.map(({ utxo }, i) => inputIsUnspent(psbts[i].txInputs[0], utxo))

  const toDelete = psbts.filter((psbt, i) => !unspent[i])

  await db.transaction(async (client) => {
    await Promise.all(toDelete.map((psbt) => removePSBTFromQueueWithClient(client, psbt)))
  })

  return psbts.filter((psbt, i) => unspent[i])
}
