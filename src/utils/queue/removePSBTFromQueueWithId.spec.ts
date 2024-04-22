import { expect } from "chai";
import { psbt1 } from "../../../test/data/psbtData";
import { sha256 } from "../crypto";
import { db } from "../db";
import { KEYS } from "../db/keys";
import { addPSBTToQueue } from "./addPSBTToQueue";
import { removePSBTFromQueueWithId } from "./removePSBTFromQueueWithId";

describe("removePSBTFromQueueWithId", () => {
  it("removes psbt from database", async () => {
    const result = await addPSBTToQueue(psbt1, 2);
    await removePSBTFromQueueWithId(result.getResult()!.id);
    expect(await db.zrange(KEYS.PSBT.QUEUE)).to.deep.equal([]);
    expect(
      await db.client.exists(KEYS.PSBT.PREFIX + sha256(psbt1.toBase64())),
    ).to.equal(0);
  });
});
