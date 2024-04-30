import { expect } from "chai";
import { psbt1, psbt2, psbt3 } from "../../../test/data/psbtData";
import { db } from "../db";
import { KEYS } from "../db/keys";
import { getPSBTsFromQueue } from "./getPSBTsFromQueue";

describe("getPSBTsFromQueue", () => {
  it("get all psbts from queue", async () => {
    await db.transaction(async (client) => {
      await client.sadd(KEYS.PSBT.QUEUE, [
        psbt1.toBase64(),
        psbt2.toBase64(),
        psbt3.toBase64(),
      ]);
    });
    const queue = await getPSBTsFromQueue();
    expect(queue).to.deep.include(psbt1);
    expect(queue).to.deep.include(psbt2);
    expect(queue).to.deep.include(psbt3);
  });
});
