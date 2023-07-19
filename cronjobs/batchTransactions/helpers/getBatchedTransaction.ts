import { Psbt } from 'bitcoinjs-lib'
import { NETWORK } from '../../../constants'

export const getBatchedTransaction = (psbts: Psbt[]) => {
  const batchedTransaction = new Psbt({ network: NETWORK })
  batchedTransaction.addInputs(psbts.map((psbt) => ({ ...psbt.txInputs[0], ...psbt.data.inputs[0] })))
  batchedTransaction.addOutputs(psbts.map((psbt) => psbt.txOutputs[0]))

  return batchedTransaction
}
