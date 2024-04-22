import { PsbtTxInput } from "bitcoinjs-lib";
import { getTxIdOfInput } from "../../../src/utils/psbt";

export const inputIsUnspent = (input: PsbtTxInput, utxos: UTXO[]) => {
  const utxoHashes = utxos.flat().map((utxo) => utxo.txid);
  return utxoHashes.includes(getTxIdOfInput(input));
};
