import { Psbt } from "bitcoinjs-lib";
import { sumPSBTOutputValues } from "../../../cronjobs/batchTransactions/helpers";
import blockExplorerData from "../../data/blockExplorerData.json";
import { getTxIdOfInput } from "../../../src/utils/psbt";

export const spiceUTXOWithPSBT = (psbt: Psbt, serviceFee = 0): UTXO[] =>
  blockExplorerData.utxo.map((utxo, i) => ({
    ...utxo,
    txid: i === 0 ? getTxIdOfInput(psbt.txInputs[0]) : utxo.txid,
    value: i === 0 ? sumPSBTOutputValues(psbt) * (1 - serviceFee) : utxo.value,
  }));
