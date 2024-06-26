import * as bitcoinjs from "bitcoinjs-lib";
import { networks, Psbt } from "bitcoinjs-lib";
import { expect } from "chai";
import Sinon from "sinon";
import {
  missingSignaturePsbt,
  psbtBase64_1,
} from "../../../test/data/psbtData";
import { finalize } from "./finalize";

describe("finalize", () => {
  it("finalizes psbt and returns transaction", () => {
    const psbt = Psbt.fromBase64(psbtBase64_1, { network: networks.regtest });
    expect(finalize(psbt).toHex()).to.equal(
      "02000000000101b5b7dc0be1b540672b5aeb81e88cc36af8dd2873ffaf3de0c2bfbcfc69faa0210000000000ffffffff01227801000000000016001475d715f9a84555e752772c9ad62be90b3b7bb88a02483045022100bd0e696620f9332cf44bc7e60e5bd5821b661cfbb5c87c7325efb36e24c9e70e02204e7efc43706e4883104008fdca437bd3cc24f6ec51a2d4369f968bbd21ac9ef483475221038f0248cc0bebc425eb55af1689a59f88119c69430a860c6a05f340e445c417d721036a901d1dceb183b143f9d423d8614926ed71302af049b701fee9a2add791e57252ae00000000",
    );
  });
  it("throws error if signatures cannot be validated", () => {
    try {
      finalize(missingSignaturePsbt);
      throw new Error("Function did not throw an error");
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      expect(error.message).to.equal("Signatures invalid for transaction");
    }
  });
  it("throws error if no partialSig exists", () => {
    const psbt = Psbt.fromBase64(psbtBase64_1, { network: networks.regtest });
    psbt.data.inputs[0].partialSig = undefined;
    Sinon.stub(psbt, "validateSignaturesOfAllInputs").returns(true);
    try {
      finalize(psbt);
      throw new Error("Function did not throw an error");
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      expect(error.message).to.equal("No partialSig found on input at index 0");
    }
  });
  it("throws error if script cannot be decompiled", () => {
    const psbt = Psbt.fromBase64(psbtBase64_1, { network: networks.regtest });
    Sinon.stub(psbt, "finalizeInput").callsFake((i, getFinalScript) => {
      if (!getFinalScript) throw new Error("getFinalScript is not defined");
      getFinalScript(
        i,
        psbt.data.inputs[i],
        Buffer.from("invalid script"),
        false,
        false,
        false,
      );
      return psbt;
    });
    try {
      finalize(psbt);
      throw new Error("Function did not throw an error");
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      expect(error.message).to.equal("Can not finalize input #0");
    }
  });
  it("throws error if there are no meaningful signatures", () => {
    const psbt = Psbt.fromBase64(psbtBase64_1, {
      network: networks.regtest,
    });
    Sinon.stub(psbt, "finalizeInput").callsFake((i, getFinalScript) => {
      if (!getFinalScript) throw new Error("getFinalScript is not defined");
      getFinalScript(
        i,
        psbt.data.inputs[i],
        Buffer.from("valid"),
        false,
        false,
        false,
      );
      return psbt;
    });
    try {
      finalize(psbt);
      throw new Error("Function did not throw an error");
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      expect(error.message).to.equal(
        "Can not finalize input #0. Signatures do not correspond to public keys",
      );
    }
  });
  it("throws an error when there is no finalScriptWitness", () => {
    const psbt = Psbt.fromBase64(psbtBase64_1, {
      network: networks.regtest,
    });
    Sinon.stub(bitcoinjs, "payments").get(() => ({
      p2wsh: () => ({
        witness: undefined,
      }),
    }));
    try {
      finalize(psbt);
      throw new Error("Function did not throw an error");
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      expect(error.message).to.equal("Unknown error finalizing input #0");
    }
  });
});
