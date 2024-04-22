import { expect } from "chai";
import { psbt1 } from "../../../test/data/psbtData";
import { getExtraPSBTDataById } from "./getExtraPSBTDataById";
import { registerPSBT } from "./registerPSBT";

describe("getExtraPSBTDataById", () => {
  it("gets extra psbt data", async () => {
    const result = await registerPSBT(psbt1, 2);
    const { psbt, revocationToken, index, txId } = await getExtraPSBTDataById(
      result.getResult().id,
    );
    expect(psbt).to.equal(psbt1.toBase64());
    expect(revocationToken).to.have.length(32);
    expect(index).to.equal(2);
    expect(txId).to.equal(undefined);
  });
});
