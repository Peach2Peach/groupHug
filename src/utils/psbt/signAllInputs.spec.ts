import { networks, Psbt } from "bitcoinjs-lib";
import { expect } from "chai";
import { missingSignature } from "../../../test/data/psbtData";
import { buyer, seller } from "../../../test/integration/signers";
import { signAllInputs } from "./signAllInputs";
import { validatePSBTSignatures } from "./validatePSBTSignatures";

describe("signAllInputs", () => {
  it("signs all inputs with signer", () => {
    const psbt = Psbt.fromBase64(missingSignature, {
      network: networks.regtest,
    });
    signAllInputs(psbt, seller, seller);
    expect(validatePSBTSignatures(psbt)).to.be.true;
  });
  it("signs all inputs with old signer", () => {
    const psbt = Psbt.fromBase64(missingSignature, {
      network: networks.regtest,
    });
    signAllInputs(psbt, buyer, seller);
    expect(validatePSBTSignatures(psbt)).to.be.true;
  });
  it("does not sign inputs with wrong signer", () => {
    const psbt = Psbt.fromBase64(missingSignature, {
      network: networks.regtest,
    });
    signAllInputs(psbt, buyer, buyer);
    expect(validatePSBTSignatures(psbt)).to.be.false;
  });
  it("does not sign inputs if there is no witnessScript", () => {
    const psbt = Psbt.fromBase64(missingSignature, {
      network: networks.regtest,
    });
    psbt.data.inputs.forEach(
      (_e, i) => (psbt.data.inputs[i].witnessScript = undefined)
    );
    signAllInputs(psbt, seller, seller);
    expect(validatePSBTSignatures(psbt)).to.be.false;
  });
});
