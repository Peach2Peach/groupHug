import { expect } from "chai";
import { describe, it } from "mocha";
import { db } from "..";

describe("zunionstore", () => {
  beforeEach(async () => {
    await db.transaction(async (client) => {
      await Promise.all([
        client.zadd("test-set-key", 10, "a"),
        client.zadd("test-set-key", 20, "b"),
        client.zadd("test-set-key-2", 30, "c"),
        client.zadd("test-set-key-2", 40, "d"),
      ]);
    });
  });
  it("should store union of sorted sets", async () => {
    await db.transaction(async (client) => {
      await client.zunionstore("test-set-destination", [
        "test-set-key",
        "test-set-key-2",
      ]);
    });
    expect(await db.zrange("test-set-destination")).to.deep.equal([
      "a",
      "b",
      "c",
      "d",
    ]);
  });
});
