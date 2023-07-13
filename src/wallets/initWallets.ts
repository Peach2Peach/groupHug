import { loadHotWallet } from './hotWallet'
import { loadFeeWallet } from './feeWallet'
import { Network } from 'bitcoinjs-lib'

export const initWallets = (xpriv: string, xpub: string, network: Network) => {
  loadHotWallet(xpriv, network)
  loadFeeWallet(xpub, network)
}
