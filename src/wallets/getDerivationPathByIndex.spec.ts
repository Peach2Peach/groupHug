import { expect } from 'chai'
import { getDerivationPathByIndex } from './getDerivationPathByIndex'
import { networks } from 'bitcoinjs-lib'

describe('getDerivationPathByIndex', () => {
  it('returns derivation path for bitcoin network', () => {
    expect(getDerivationPathByIndex(0, networks.bitcoin)).to.equal(
      'm/48\'/0\'/0\'/0/0',
    )
    expect(getDerivationPathByIndex(10, networks.bitcoin)).to.equal(
      'm/48\'/0\'/0\'/0/10',
    )
  })
  it('returns derivation path for testnet network', () => {
    expect(getDerivationPathByIndex(0, networks.testnet)).to.equal(
      'm/48\'/1\'/0\'/0/0',
    )
    expect(getDerivationPathByIndex(10, networks.testnet)).to.equal(
      'm/48\'/1\'/0\'/0/10',
    )
  })
})
