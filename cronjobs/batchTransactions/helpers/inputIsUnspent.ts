import { PsbtTxInput } from "bitcoinjs-lib";
import { getTxIdOfInput } from "../../../src/utils/psbt";

export const inputIsUnspent = (
  input: PsbtTxInput,
  utxos: UTXO[] | undefined,
) =>
  utxos
    ? utxos?.flat().some((utxo) => utxo.txid === getTxIdOfInput(input))
    : undefined;
