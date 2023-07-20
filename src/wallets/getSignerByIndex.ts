import { Network } from 'bitcoinjs-lib'
import { getDerivationPathByIndex } from './getDerivationPathByIndex'
import { BIP32Interface } from 'bip32'

export const getSignerByIndex = (hdWallet: BIP32Interface, index: number | string, network: Network) =>
  hdWallet.derivePath(getDerivationPathByIndex(index, network))
