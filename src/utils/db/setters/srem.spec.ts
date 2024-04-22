import { ok } from "assert";
import { describe, it } from "mocha";
import { db } from "..";

describe("srem", () => {
  beforeEach(async () => {
    await db.transaction(async (client) => {
      await Promise.all([
        client.sadd("test-set-key", "1"),
        client.sadd("test-set-key", "a"),
        client.sadd("test-set-key", "b"),
      ]);
    });
  });
  it("should setup test", async () => {
    const entry = await db.smembers("test-set-key");
    ok(entry.indexOf("1") !== -1);
    ok(entry.indexOf("a") !== -1);
    ok(entry.indexOf("b") !== -1);
  });
  it("should remove a member from a set", async () => {
    await db.transaction(async (client) => {
      await client.srem("test-set-key", "b");
    });

    const entry = await db.smembers("test-set-key");

    ok(entry.indexOf("1") !== -1);
    ok(entry.indexOf("a") !== -1);
    ok(entry.indexOf("b") === -1);
  });

  it("should remove multiple members from a set", async () => {
    await db.transaction(async (client) => {
      await client.srem("test-set-key", ["a", "b"]);
    });

    const entry = await db.smembers("test-set-key");

    ok(entry.indexOf("1") !== -1);
    ok(entry.indexOf("a") === -1);
    ok(entry.indexOf("b") === -1);
  });
});
