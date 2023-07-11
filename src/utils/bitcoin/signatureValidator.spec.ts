import { expect } from 'chai'
import { describe, it } from 'mocha'
import { signatureValidator } from './signatureValidator'

describe('signatureValidator', () => {
  const publicKey = Buffer.from('033afdde30166be53729492808ddb715efc68e32c0d5a057614952ce4e9a85b419', 'hex')
  const msgHash = Buffer.from('79c64dfe32856ec6f5531d3b59d9b671c52b08b47f3ea7f2853dd9e98245de46', 'hex')
  const signature = Buffer.from(
    // eslint-disable-next-line max-len
    'fbfa4cb916c51c3e66289a8ee8b95ed2d1690d966d277a6a4729ab77fea5488a1ccfaf75050b6cb8f032b110002ac6209ec6ad2333abe16a6477f76c00eb7e3b',
    'hex',
  )
  const invalid = Buffer.from('invalid')
  it('should return true if the signature is valid', () => {
    expect(signatureValidator(publicKey, msgHash, signature)).to.be.true
  })
  it('should return false if the signature is not valid', () => {
    expect(signatureValidator(invalid, msgHash, signature)).to.be.false
    expect(signatureValidator(publicKey, invalid, signature)).to.be.false
    expect(signatureValidator(publicKey, msgHash, invalid)).to.be.false
  })
})
