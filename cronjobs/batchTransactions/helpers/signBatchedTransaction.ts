import { Psbt } from 'bitcoinjs-lib'
import { NETWORK, SIGHASH } from '../../../constants'
import { getSignerByIndex, hotWallet } from '../../../src/wallets'

export const signBatchedTransaction = (batchedTransaction: Psbt, extraPSBTData: Record<string, string>[]) => {
  batchedTransaction.txInputs.forEach((input, i) => {
    if (!extraPSBTData[i].index) return

    const signer = getSignerByIndex(hotWallet, extraPSBTData[i].index, NETWORK)
    if (!batchedTransaction.data.inputs[i].witnessScript.includes(signer.publicKey)) return

    batchedTransaction.updateInput(i, { sighashType: SIGHASH.ALL })
    batchedTransaction.signInput(i, signer, [SIGHASH.ALL])
  })
}
