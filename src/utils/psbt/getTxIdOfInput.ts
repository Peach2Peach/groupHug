import { PsbtTxInput } from "bitcoinjs-lib";

export const getTxIdOfInput = (input: PsbtTxInput) =>
  Buffer.from(input.hash).reverse().toString("hex");
