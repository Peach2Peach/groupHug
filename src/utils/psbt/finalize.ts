import { Psbt } from 'bitcoinjs-lib'
import { getFinalScript } from '../../../test/integration/helpers/getFinalScript'
import { validatePSBTSignatures } from './validatePSBTSignatures'

export const finalize = (psbt: Psbt) => {
  if (validatePSBTSignatures(psbt)) {
    psbt.txInputs.forEach((input, i) => psbt.finalizeInput(i, getFinalScript))
    return psbt.extractTransaction()
  }
  throw Error('Signatures invalid for transaction')
}
