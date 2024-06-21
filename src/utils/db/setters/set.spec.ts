import { strictEqual } from "assert";
import { describe, it } from "mocha";
import { db } from "..";

describe("set", () => {
  it("should set a value to database", async () => {
    await db.transaction(async (client) => {
      await client.set("test-key", "test-val");
    });

    strictEqual(await db.client.get("test-key"), "test-val");
  });

  it("should set a value to database with expiration date", async () => {
    await db.transaction(async (client) => {
      await client.set("expiring-key", "expiring-val", 3000);
    });

    strictEqual(await db.client.ttl("expiring-key"), 3);
    strictEqual(await db.client.get("expiring-key"), "expiring-val");
  });
});
