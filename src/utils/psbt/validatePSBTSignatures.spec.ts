import { expect } from 'chai'
import { missingSignaturePsbt, psbt1 } from '../../../test/data/psbtData'
import { validatePSBTSignatures } from './validatePSBTSignatures'

describe('validatePSBTSignatures', () => {
  it('returns true for PSBT with valid signatures', () => {
    expect(validatePSBTSignatures(psbt1)).to.be.true
  })
  it('returns false for PSBT with invalid signatures', () => {
    expect(validatePSBTSignatures(missingSignaturePsbt)).to.be.false
  })
})
