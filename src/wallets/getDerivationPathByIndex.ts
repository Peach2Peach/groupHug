import { Network } from 'bitcoinjs-lib'
import { isTestnet } from '../utils/bitcoin'

export const getDerivationPathByIndex = (index: number | string, network: Network) =>
  `m/48'/${isTestnet(network) ? '1' : '0'}'/0'/0/${index}`
