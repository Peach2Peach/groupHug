import { Psbt, Signer } from "bitcoinjs-lib";
import { SIGHASH } from "../../../constants";

export const signAllInputs = (
  psbt: Psbt,
  signer: Signer,
  oldSigner: Signer,
) => {
  psbt.txInputs.forEach((input, i) => {
    delete psbt.data.inputs[i].sighashType;
    psbt.updateInput(i, { sighashType: SIGHASH.ALL });
    if (!psbt.data.inputs[i].witnessScript.includes(signer.publicKey)) {
      if (psbt.data.inputs[i].witnessScript.includes(oldSigner.publicKey)) {
        psbt.signInput(i, oldSigner, [SIGHASH.ALL]);
        return;
      }
      return;
    }
    psbt.signInput(i, signer, [SIGHASH.ALL]);
  });
};
