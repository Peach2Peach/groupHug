import { Psbt } from "bitcoinjs-lib";
import { signatureValidator } from "../bitcoin/signatureValidator";

export const validatePSBTSignatures = (psbt: Psbt) => {
  try {
    return psbt.validateSignaturesOfAllInputs(signatureValidator);
  } catch (e) {
    return false;
  }
};
