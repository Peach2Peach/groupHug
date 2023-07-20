import { PsbtTxInput } from 'bitcoinjs-lib'
import blockExplorerData from '../../data/blockExplorerData.json'

export const spiceUTXOWithPSBTInput = (input: PsbtTxInput): UTXO[] =>
  blockExplorerData.utxo.map((utxo, i) => ({
    ...utxo,
    txid: i === 0 ? input.hash.toString('hex') : utxo.txid,
  }))
