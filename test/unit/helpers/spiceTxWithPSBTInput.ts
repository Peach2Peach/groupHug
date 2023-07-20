import { PsbtTxInput } from 'bitcoinjs-lib'
import blockExplorerData from '../../data/blockExplorerData.json'

export const spiceTxWithPSBTInput = (input: PsbtTxInput): Transaction => ({
  ...blockExplorerData.tx,
  txid: input.hash.toString('hex'),
})
