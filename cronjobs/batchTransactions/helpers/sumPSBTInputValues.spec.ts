import { networks, Psbt } from "bitcoinjs-lib";
import { expect } from "chai";
import { psbtWith2ndInput } from "../../../test/data/psbtData";
import { sumPSBTInputValues } from "./sumPSBTInputValues";

describe("sumPSBTInputValues", () => {
  it("returns the sum of the values of psbt outputs", () => {
    const psbt = Psbt.fromBase64(psbtWith2ndInput, {
      network: networks.regtest,
    });
    expect(sumPSBTInputValues(psbt)).to.equal(300000);
  });
  it("uses 0 as default value if no witnessUtxo exists", () => {
    const psbt = Psbt.fromBase64(psbtWith2ndInput, {
      network: networks.regtest,
    });
    psbt.data.inputs.forEach(
      (_e, i) => (psbt.data.inputs[i].witnessUtxo = undefined)
    );
    expect(sumPSBTInputValues(psbt)).to.equal(0);
  });
});
