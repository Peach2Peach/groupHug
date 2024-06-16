import { Psbt } from "bitcoinjs-lib";

export const sumPSBTInputValues = (psbt: Psbt) =>
  psbt.data.inputs.reduce((sum, u) => sum + (u.witnessUtxo?.value || 0), 0);
