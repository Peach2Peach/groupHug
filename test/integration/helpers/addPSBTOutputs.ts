import { Psbt } from "bitcoinjs-lib";

export const addPSBTOutputs = (psbt: Psbt, address: string, value: number) => {
  const fees = value * 0.02;
  const miningFees = 10 * 171;
  const outputValue = value - fees - miningFees;
  psbt.addOutput({
    address,
    value: outputValue,
  });

  return psbt;
};
