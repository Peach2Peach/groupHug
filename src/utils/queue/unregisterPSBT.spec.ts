import { expect } from "chai";
import { psbt1 } from "../../../test/data/psbtData";
import { db } from "../db";
import { KEYS } from "../db/keys";
import { registerPSBT } from "./registerPSBT";
import { unregisterPSBT } from "./unregisterPSBT";

describe("unregisterPSBT", () => {
  it("deletes psbt data", async () => {
    const result = await registerPSBT(psbt1);
    // @ts-ignore
    const { id } = result.getResult();
    expect(await db.client.exists(KEYS.PSBT.PREFIX + id)).to.equal(1);
    await unregisterPSBT(psbt1);
    expect(await db.client.exists(KEYS.PSBT.PREFIX + id)).to.equal(0);
  });
});
