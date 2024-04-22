import { PsbtTxInput } from "bitcoinjs-lib";
import blockExplorerData from "../../data/blockExplorerData.json";
import { getTxIdOfInput } from "../../../src/utils/psbt";

export const spiceUTXOWithPSBTInput = (input: PsbtTxInput): UTXO[] =>
  blockExplorerData.utxo.map((utxo, i) => ({
    ...utxo,
    txid: i === 0 ? getTxIdOfInput(input) : utxo.txid,
  }));
