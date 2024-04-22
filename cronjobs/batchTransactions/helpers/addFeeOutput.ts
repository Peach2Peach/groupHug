import { Psbt } from "bitcoinjs-lib";

export const addFeeOutput = (
  batchedTransaction: Psbt,
  address: string,
  value: number,
) => {
  batchedTransaction.addOutput({
    address,
    value,
  });
};
