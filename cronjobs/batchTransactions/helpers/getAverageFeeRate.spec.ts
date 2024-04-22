import { Psbt, networks } from "bitcoinjs-lib";
import { expect } from "chai";
import { batchQueue } from "../../../test/data/psbtData";
import { getAverageFeeRate } from "./getAverageFeeRate";

describe("getAverageFeeRate", () => {
  const psbts = batchQueue.map(({ feeRate, psbt }) => ({
    feeRate,
    psbt: Psbt.fromBase64(psbt, { network: networks.regtest }),
  }));

  it("should calculate average fee rate of bucket", () => {
    expect(getAverageFeeRate(psbts.slice(80, 100))).to.equal(27.95);
    expect(getAverageFeeRate(psbts.slice(68, 80))).to.equal(22.37);
    expect(getAverageFeeRate(psbts.slice(61, 68))).to.equal(19.92);
    expect(getAverageFeeRate(psbts.slice(58, 61))).to.equal(18.07);
    expect(getAverageFeeRate(psbts.slice(51, 58))).to.equal(15.65);
    expect(getAverageFeeRate(psbts.slice(48, 51))).to.equal(12.8);
    expect(getAverageFeeRate(psbts.slice(45, 48))).to.equal(11.04);
    expect(getAverageFeeRate(psbts.slice(33, 45))).to.equal(8.29);
    expect(getAverageFeeRate(psbts.slice(19, 33))).to.equal(6.05);
    expect(getAverageFeeRate(psbts.slice(9, 19))).to.equal(4);
    expect(getAverageFeeRate(psbts.slice(0, 9))).to.equal(1.84);
  });
});
