import { expect } from "chai";
import {
  missingSignaturePsbt,
  psbt1,
  wrongSighashPsbt,
} from "../../../test/data/psbtData";
import { isSignedWithSighash } from "./isSignedWithSighash";

describe("isSignedWithSighash", () => {
  it("returns true for PSBT with valid signatures", () => {
    expect(isSignedWithSighash(psbt1, "SINGLE_ANYONECANPAY")).to.be.true;
  });
  it("returns false for PSBT with invalid signatures", () => {
    expect(isSignedWithSighash(wrongSighashPsbt, "SINGLE_ANYONECANPAY")).to.be
      .false;
    expect(isSignedWithSighash(missingSignaturePsbt, "SINGLE_ANYONECANPAY")).to
      .be.false;
  });
});
