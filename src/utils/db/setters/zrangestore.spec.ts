import { expect } from "chai";
import { describe, it } from "mocha";
import { db } from "..";

describe("zrangestore", () => {
  beforeEach(async () => {
    await db.transaction(async (client) => {
      await Promise.all([
        client.zadd("test-set-key", 10, "a"),
        client.zadd("test-set-key", 20, "b"),
        client.zadd("test-set-key", 30, "c"),
        client.zadd("test-set-key", 40, "d"),
      ]);
    });
  });
  it("should store items with scores", async () => {
    await db.transaction(async (client) => {
      await client.zrangestore("test-set-destination", "test-set-key");
    });
    expect(await db.zrange("test-set-destination")).to.deep.equal([
      "a",
      "b",
      "c",
      "d",
    ]);
  });
  it("should store items within a range by score", async () => {
    await db.transaction(async (client) => {
      await client.zrangestore("test-set-destination", "test-set-key", 20, 30);
    });
    expect(await db.zrange("test-set-destination")).to.deep.equal(["b", "c"]);
  });
  it("should store items within a range by index", async () => {
    await db.transaction(async (client) => {
      await client.zrangestore(
        "test-set-destination",
        "test-set-key",
        2,
        3,
        false,
      );
    });
    expect(await db.zrange("test-set-destination")).to.deep.equal(["c", "d"]);
  });

  it("should store an empty array for non existing sorted sets", async () => {
    await db.transaction(async (client) => {
      await client.zrangestore("test-set-destination", "test-set-nonexistent");
    });
    const entry = await db.zrange("test-set-destination");
    expect(entry.length).to.equal(0);
  });
});
