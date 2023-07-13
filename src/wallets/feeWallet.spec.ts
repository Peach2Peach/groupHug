import { networks } from 'bitcoinjs-lib'
import { expect } from 'chai'
import { xpub } from '../../test/data/walletData'
import { feeWallet, loadFeeWallet } from './feeWallet'

describe('loadFeeWallet', () => {
  it('initializes fee wallet with xpub', () => {
    const wallet = loadFeeWallet(xpub, networks.regtest)
    expect(wallet).to.deep.equal(feeWallet)
    expect(feeWallet.network).to.equal(networks.regtest)
    expect(feeWallet.toBase58()).to.equal(xpub)
  })
})
