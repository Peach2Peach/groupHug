import { Psbt } from 'bitcoinjs-lib'
import { signatureValidator } from '../bitcoin'

export const validatePSBTSignatures = (psbt: Psbt) => {
  try {
    return psbt.validateSignaturesOfAllInputs(signatureValidator)
  } catch (e) {
    return false
  }
}
