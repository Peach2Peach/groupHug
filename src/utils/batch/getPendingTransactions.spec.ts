import { expect } from "chai";
import { db } from "../db";
import { KEYS } from "../db/keys";
import { getPendingTransactions } from "./getPendingTransactions";

describe("getPendingTransactions", () => {
  const txId = "txId";
  it("adds pending transaction from set", async () => {
    await db.transaction((client) =>
      client.sadd(KEYS.TRANSACTION.PENDING, txId)
    );
    expect(await getPendingTransactions()).to.deep.equal([txId]);
  });
});
