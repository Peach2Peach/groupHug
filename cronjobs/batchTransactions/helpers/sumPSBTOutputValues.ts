import { Psbt } from "bitcoinjs-lib";

export const sumPSBTOutputValues = (psbt: Psbt) =>
  psbt.txOutputs.reduce((sum, u) => sum + u.value, 0);
