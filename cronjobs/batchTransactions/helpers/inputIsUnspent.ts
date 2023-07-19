import { PsbtTxInput } from 'bitcoinjs-lib'

export const inputIsUnspent = (input: PsbtTxInput, utxos: UTXO[]) => {
  const utxoHashes = utxos.flat().map((utxo) => utxo.txid)
  return utxoHashes.includes(input.hash.toString('hex'))
}
