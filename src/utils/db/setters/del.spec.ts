import { strictEqual } from "assert";
import { describe, it } from "mocha";
import { db } from "..";

describe("del", () => {
  it("should delete a value from database", async () => {
    await db.transaction(async (client) => {
      await Promise.all([
        client.set("test-key", 1),
        client.hset("test-hm-key", { a: 1 }),
      ]);
      await Promise.all([client.del("test-key"), client.del("test-hm-key")]);
    });

    strictEqual(await db.client.get("test-key"), null);
    strictEqual(await db.client.get("test-hm-key"), null);
  });
});
