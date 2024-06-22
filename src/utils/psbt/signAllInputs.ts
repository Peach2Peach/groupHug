import { Psbt, Signer } from "bitcoinjs-lib";
import { SIGHASH } from "../../../constants";

export const signAllInputs = (
  psbt: Psbt,
  signer: Signer,
  oldSigner: Signer,
) => {
  psbt.txInputs.forEach((_input, i) => {
    delete psbt.data.inputs[i].sighashType;
    psbt.updateInput(i, { sighashType: SIGHASH.ALL });
    const { witnessScript } = psbt.data.inputs[i];
    if (!witnessScript) return;
    if (!witnessScript.includes(signer.publicKey)) {
      if (witnessScript.includes(oldSigner.publicKey)) {
        psbt.signInput(i, oldSigner, [SIGHASH.ALL]);
        return;
      }
      return;
    }
    psbt.signInput(i, signer, [SIGHASH.ALL]);
  });
};
