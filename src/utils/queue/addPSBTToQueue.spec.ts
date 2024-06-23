import { expect } from "chai";
import { psbt1 } from "../../../test/data/psbtData";
import { db } from "../db";
import { KEYS } from "../db/keys";
import { addPSBTToQueue } from "./addPSBTToQueue";

describe("addPSBTToQueue", () => {
  const index = 1;
  it("stores psbt with fee rate to queue in database", async () => {
    const base64 = psbt1.toBase64();
    const { result } = await addPSBTToQueue(psbt1, index);
    if (!result) throw new Error("Result should not be null");
    const { id, revocationToken } = result;
    expect(await db.client.sMembers(KEYS.PSBT.QUEUE)).to.deep.equal([base64]);
    expect(await db.client.hGetAll(KEYS.PSBT.PREFIX + id)).to.deep.equal({
      psbt: base64,
      revocationToken,
      index: String(index),
    });
  });
});
