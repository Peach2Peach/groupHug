import { PsbtTxInput } from "bitcoinjs-lib";
import { getTxIdOfInput } from "../../../src/utils/psbt";

export const inputIsUnspent = (input: PsbtTxInput, utxos: UTXO[]) =>
  utxos.flat().some((utxo) => utxo.txid === getTxIdOfInput(input));
