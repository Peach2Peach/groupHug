import { expect } from "chai";
import { psbt1 } from "../../../test/data/psbtData";
import { addPSBTToQueue } from "./addPSBTToQueue";
import { getFeeRate } from "./getFeeRate";

describe("getFeeRate", () => {
  it("gets stored fee rate of a psbt", async () => {
    await addPSBTToQueue(psbt1, 2);
    const feeRate = await getFeeRate(psbt1.toBase64());
    expect(feeRate).to.equal(2);
  });
});
