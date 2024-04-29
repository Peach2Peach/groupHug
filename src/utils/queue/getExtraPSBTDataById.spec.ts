import { expect } from "chai";
import { psbt1, psbtBase64_1 } from "../../../test/data/psbtData";
import { db } from "../db";
import { getExtraPSBTDataById } from "./getExtraPSBTDataById";
import { registerPSBTWithClient } from "./registerPSBTWithClient";

describe("getExtraPSBTDataById", () => {
  it("gets extra psbt data", async () => {
    const result = await db.transaction((client) =>
      registerPSBTWithClient(client, psbtBase64_1, 2)
    );
    const { psbt, revocationToken, index, txId } = (await getExtraPSBTDataById(
      result.getResult()!.id
    ))!;
    expect(psbt).to.equal(psbt1.toBase64());
    expect(revocationToken).to.have.length(32);
    expect(index).to.equal(2);
    expect(txId).to.equal(undefined);
  });
});
