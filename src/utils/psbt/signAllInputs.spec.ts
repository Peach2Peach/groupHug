import { Psbt } from 'bitcoinjs-lib'
import { expect } from 'chai'
import { missingSignature } from '../../../test/data/psbtData'
import { seller } from '../../../test/integration/signers'
import { signAllInputs } from './signAllInputs'
import { validatePSBTSignatures } from './validatePSBTSignatures'

describe('signAllInputs', () => {
  it('signs all inputs with signer', () => {
    const psbt = Psbt.fromBase64(missingSignature)
    signAllInputs(psbt, seller)
    expect(validatePSBTSignatures(psbt)).to.be.true
  })
})
