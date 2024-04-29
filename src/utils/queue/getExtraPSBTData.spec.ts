import { expect } from "chai";
import { psbt1, psbtBase64_1 } from "../../../test/data/psbtData";
import { db } from "../db";
import { getExtraPSBTData } from "./getExtraPSBTData";
import { registerPSBTWithClient } from "./registerPSBTWithClient";

describe("getExtraPSBTData", () => {
  it("gets extra psbt data", async () => {
    await db.transaction((client) =>
      registerPSBTWithClient(client, psbtBase64_1, 2)
    );
    const { psbt, revocationToken, index } = (await getExtraPSBTData(psbt1))!;
    expect(psbt).to.equal(psbt1.toBase64());
    expect(revocationToken).to.have.length(32);
    expect(index).to.equal(2);
  });
});
