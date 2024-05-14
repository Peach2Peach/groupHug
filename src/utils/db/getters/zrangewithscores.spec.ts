import { expect } from "chai";
import { describe, it } from "mocha";
import { db } from "..";

describe("zrangewithscores", () => {
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
  it("should return items with scores", async () => {
    const entry = await db.zrangewithscores("test-set-key");
    expect(entry).to.deep.equal([
      { score: 10, value: "a" },
      { score: 20, value: "b" },
      { score: 30, value: "c" },
      { score: 40, value: "d" },
    ]);
  });
  it("should items within a range by score", async () => {
    const entry = await db.zrangewithscores("test-set-key", 20, 30);
    expect(entry).to.deep.equal([
      { score: 20, value: "b" },
      { score: 30, value: "c" },
    ]);
  });
  it("should items within a range by index", async () => {
    const entry = await db.zrangewithscores("test-set-key", 2, 3, false);
    expect(entry).to.deep.equal([
      { score: 30, value: "c" },
      { score: 40, value: "d" },
    ]);
  });

  it("should return items with scores in reverse", async () => {
    const entry = await db.zrangewithscores(
      "test-set-key",
      undefined,
      undefined,
      true,
      true,
    );
    expect(entry).to.deep.equal([
      { score: 40, value: "d" },
      { score: 30, value: "c" },
      { score: 20, value: "b" },
      { score: 10, value: "a" },
    ]);
  });

  it("should return an empty array for non existing sorted sets", async () => {
    const entry = await db.zrangewithscores("test-non-existent-set-key");
    expect(entry.length).to.equal(0);
  });
});
