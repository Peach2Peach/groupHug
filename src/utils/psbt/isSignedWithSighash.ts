import { Psbt } from "bitcoinjs-lib";
import { SIGHASH } from "../../../constants";

export const isSignedWithSighash = (
  psbt: Psbt,
  sighash: keyof typeof SIGHASH,
) => psbt.data.inputs.every((input) => input.sighashType === SIGHASH[sighash]);
