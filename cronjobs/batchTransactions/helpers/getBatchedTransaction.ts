import { Network, Psbt } from 'bitcoinjs-lib'

export const getBatchedTransaction = (psbts: Psbt[], network: Network) => {
  const batchedTransaction = new Psbt({ network })
  batchedTransaction.addInputs(psbts.map((psbt) => ({ ...psbt.txInputs[0], ...psbt.data.inputs[0] })))
  batchedTransaction.addOutputs(psbts.map((psbt) => psbt.txOutputs[0]))

  return batchedTransaction
}
