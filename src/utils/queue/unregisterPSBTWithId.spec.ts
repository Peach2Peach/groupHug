import { expect } from "chai";
import { psbt1 } from "../../../test/data/psbtData";
import { db } from "../db";
import { KEYS } from "../db/keys";
import { registerPSBT } from "./registerPSBT";
import { unregisterPSBTWithId } from "./unregisterPSBTWithId";

describe("unregisterPSBTWithId", () => {
  it("deletes psbt data with id", async () => {
    const result = await registerPSBT(psbt1);
    // @ts-ignore
    const { id } = result.getResult();
    expect(await db.client.exists(KEYS.PSBT.PREFIX + id)).to.equal(1);
    await unregisterPSBTWithId(id);
    expect(await db.client.exists(KEYS.PSBT.PREFIX + id)).to.equal(0);
  });
});
