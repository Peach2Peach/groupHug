import { expect } from "chai";
import { describe, it } from "mocha";
import { db } from "..";

describe("zinterstore", () => {
  beforeEach(async () => {
    await db.transaction(async (client) => {
      await Promise.all([
        client.zadd("test-set-1", 1, "1"),
        client.zadd("test-set-1", 2, "2"),
        client.zadd("test-set-1", 3, "3"),
        client.zadd("test-set-2", 4, "3"),
        client.zadd("test-set-2", 5, "2"),
        client.zadd("test-set-2", 6, "6"),
      ]);
    });
  });
  it("should store intersection of sorted sets", async () => {
    await db.transaction(async (client) => {
      await client.zinterstore("test-set-inter", ["test-set-1", "test-set-2"]);
    });
    expect(await db.zrangewithscores("test-set-inter")).to.deep.equal([
      {
        score: 7,
        value: "2",
      },
      {
        score: 7,
        value: "3",
      },
    ]);
  });
  it("should store intersection of sorted sets aggregated by max score", async () => {
    await db.transaction(async (client) => {
      await client.zinterstore(
        "test-set-inter",
        ["test-set-1", "test-set-2"],
        "MAX",
      );
    });

    expect(await db.zrangewithscores("test-set-inter")).to.deep.equal([
      {
        score: 4,
        value: "3",
      },
      {
        score: 5,
        value: "2",
      },
    ]);
  });
  it("should store intersection of sorted sets aggregated by min score", async () => {
    await db.transaction(async (client) => {
      await client.zinterstore(
        "test-set-inter",
        ["test-set-1", "test-set-2"],
        "MIN",
      );
    });

    expect(await db.zrangewithscores("test-set-inter")).to.deep.equal([
      {
        score: 2,
        value: "2",
      },
      {
        score: 3,
        value: "3",
      },
    ]);
  });
  it("should store intersection of sorted sets aggregated by sum score", async () => {
    await db.transaction(async (client) => {
      await client.zinterstore(
        "test-set-inter",
        ["test-set-1", "test-set-2"],
        "SUM",
      );
    });

    expect(await db.zrangewithscores("test-set-inter")).to.deep.equal([
      {
        score: 7,
        value: "2",
      },
      {
        score: 7,
        value: "3",
      },
    ]);
  });
});
