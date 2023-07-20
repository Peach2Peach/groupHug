import { expect } from 'chai'
import { getSignerByIndex } from './getSignerByIndex'
import { networks } from 'bitcoinjs-lib'
import { bip32 } from '../../constants'
import { xpriv } from '../../test/data/walletData'

describe('getSignerByIndex', () => {
  const wallet = bip32.fromBase58(xpriv, networks.regtest)

  it('returns derivation path for bitcoin network', () => {
    expect(
      getSignerByIndex(wallet, 0, networks.bitcoin).publicKey.toString('hex'),
    ).to.equal(
      '03216014a00d27cee0fd47b3836b56b1e97c375c98748387009598cb0fa2b13c30',
    )
    expect(
      getSignerByIndex(wallet, 10, networks.bitcoin).publicKey.toString('hex'),
    ).to.equal(
      '039c332d9227ba5791efafaf39cd1bbf8f3ae7c474585884b622e595957376eb17',
    )
  })
  it('returns derivation path for testnet network', () => {
    expect(
      getSignerByIndex(wallet, 0, networks.testnet).publicKey.toString('hex'),
    ).to.equal(
      '038d384d1e3aa6d454c21676b7ac62fd38906157270c6d5bfd51b11c9122b88a03',
    )
    expect(
      getSignerByIndex(wallet, 10, networks.testnet).publicKey.toString('hex'),
    ).to.equal(
      '021b4e90738b5cceca70b152f341c7112b9b81646345598050e9a8437313623b11',
    )
  })
})
