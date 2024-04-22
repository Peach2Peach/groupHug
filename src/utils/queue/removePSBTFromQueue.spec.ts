import { expect } from "chai";
import { db } from "../db";
import { addPSBTToQueue } from "./addPSBTToQueue";
import { psbt1 } from "../../../test/data/psbtData";
import { KEYS } from "../db/keys";
import { removePSBTFromQueue } from "./removePSBTFromQueue";
import { sha256 } from "../crypto";

describe("removePSBTFromQueue", () => {
  it("removes psbt from database", async () => {
    await addPSBTToQueue(psbt1, 2);
    await removePSBTFromQueue(psbt1);
    expect(await db.zrange(KEYS.PSBT.QUEUE)).to.deep.equal([]);
    expect(
      await db.client.exists(KEYS.PSBT.PREFIX + sha256(psbt1.toBase64())),
    ).to.equal(0);
  });
});
