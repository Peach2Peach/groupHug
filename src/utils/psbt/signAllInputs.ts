import { Psbt, Signer } from 'bitcoinjs-lib'
import { SIGHASH } from '../../../constants'

export const signAllInputs = (psbt: Psbt, signer: Signer) => {
  psbt.txInputs.forEach((input, i) => {
    delete psbt.data.inputs[i].sighashType
    psbt.updateInput(i, { sighashType: SIGHASH.ALL })
    if (!psbt.data.inputs[i].witnessScript.includes(signer.publicKey)) return
    psbt.signInput(i, signer, [SIGHASH.ALL])
  })
}
