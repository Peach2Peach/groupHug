import { expect } from "chai";
import { psbt1 } from "../../../test/data/psbtData";
import { db } from "../db";
import { KEYS } from "../db/keys";
import { unregisterPSBT } from "./unregisterPSBT";
import { registerPSBT } from "./registerPSBT";

describe("unregisterPSBT", () => {
  it("deletes psbt data", async () => {
    const result = await registerPSBT(psbt1);
    const { id } = result.getResult();
    expect(await db.client.exists(KEYS.PSBT.PREFIX + id)).to.equal(1);
    await unregisterPSBT(psbt1);
    expect(await db.client.exists(KEYS.PSBT.PREFIX + id)).to.equal(0);
  });
});
