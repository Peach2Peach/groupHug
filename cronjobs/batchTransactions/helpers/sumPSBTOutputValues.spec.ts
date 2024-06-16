import { Psbt, networks } from "bitcoinjs-lib";
import { expect } from "chai";
import { psbtWith2ndOutput } from "../../../test/data/psbtData";
import { sumPSBTOutputValues } from "./sumPSBTOutputValues";

describe("sumPSBTOutputValues", () => {
  it("returns the sum of the values of psbt outputs", () => {
    const psbt = Psbt.fromBase64(psbtWith2ndOutput, {
      network: networks.regtest,
    });
    expect(sumPSBTOutputValues(psbt)).to.equal(98290);
  });
});
