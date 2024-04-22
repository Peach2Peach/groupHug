import { expect } from "chai";
import { psbt1 } from "../../../test/data/psbtData";
import { getExtraPSBTData } from "./getExtraPSBTData";
import { registerPSBT } from "./registerPSBT";

describe("getExtraPSBTData", () => {
  it("gets extra psbt data", async () => {
    await registerPSBT(psbt1, 2);
    const { psbt, revocationToken, index } = (await getExtraPSBTData(psbt1))!;
    expect(psbt).to.equal(psbt1.toBase64());
    expect(revocationToken).to.have.length(32);
    expect(index).to.equal(2);
  });
});
