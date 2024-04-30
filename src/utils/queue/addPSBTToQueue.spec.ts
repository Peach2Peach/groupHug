import { expect } from "chai";
import { psbt1 } from "../../../test/data/psbtData";
import { db } from "../db";
import { KEYS } from "../db/keys";
import { addPSBTToQueue } from "./addPSBTToQueue";

describe("addPSBTToQueue", () => {
  const index = 1;
  it("stores psbt with fee rate to queue in database", async () => {
    const base64 = psbt1.toBase64();
    const result = await addPSBTToQueue(psbt1, index);
    const { id, revocationToken } = result.getResult()!;
    expect(await db.smembers(KEYS.PSBT.QUEUE)).to.deep.equal([base64]);
    expect(await db.hgetall(KEYS.PSBT.PREFIX + id)).to.deep.equal({
      psbt: base64,
      revocationToken,
      index: String(index),
    });
  });
});
