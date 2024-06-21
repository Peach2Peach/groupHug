import { PsbtTxInput } from "bitcoinjs-lib";
import { getTx } from "../../src/utils/electrs/getTx";
import { getUTXO } from "../../src/utils/electrs/getUTXO";
import { getTxIdOfInput } from "../../src/utils/psbt";

export async function getUTXOForInput(input: PsbtTxInput) {
  const inputTxId = getTxIdOfInput(input);
  const { result: tx } = await getTx(inputTxId);

  if (!tx) return undefined;

  const output = tx.vout[input.index];
  if (!output.scriptpubkey_address) return undefined;
  const { result: utxo } = await getUTXO(output.scriptpubkey_address);

  return utxo?.filter((utx) => utx.txid === inputTxId);
}
