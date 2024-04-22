import { PsbtTxInput } from "bitcoinjs-lib";
import { getUTXO } from "../../../src/utils/electrs";
import { getTxIdOfInput } from "../../../src/utils/psbt";
import { getTxForInput } from "./getTxForInput";

export const getTxAndUTXOForInput = async (input: PsbtTxInput) => {
  const tx = await getTxForInput(input);

  if (!tx) return undefined;

  const output = tx.vout[input.index];
  const { result: utxo } = await getUTXO(output.scriptpubkey_address!);

  return {
    tx,
    utxo: utxo?.filter((utx) => utx.txid === getTxIdOfInput(input)),
  };
};
