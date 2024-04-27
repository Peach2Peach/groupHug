import { expect } from "chai";
import { db } from "../db";
import { KEYS } from "../db/keys";
import { addConfirmedTransaction } from "./addConfirmedTransaction";

describe("addConfirmedTransaction", () => {
  const txId = "txId";
  it("adds confirmed transaction from set and removes it from pending", async () => {
    await db.transaction((client) =>
      client.sadd(KEYS.TRANSACTION.PENDING, txId)
    );
    expect(await db.smembers(KEYS.TRANSACTION.PENDING)).to.deep.equal([txId]);
    await addConfirmedTransaction(txId);
    expect(await db.smembers(KEYS.TRANSACTION.PENDING)).to.deep.equal([]);
    expect(await db.smembers(KEYS.TRANSACTION.CONFIRMED)).to.deep.equal([txId]);
  });
});
