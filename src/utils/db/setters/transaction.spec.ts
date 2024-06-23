import { strictEqual } from "assert";
import { describe, it } from "mocha";
import { db } from "..";

describe("transaction", () => {
  it("should update multiple values", async () => {
    await db.transaction(async (client) => {
      await Promise.all([
        client.set("test-key", "test-val"),
        client.set("test-key-2", "test-val-2"),
      ]);
    });

    const [value1, value2] = await Promise.all([
      db.client.get("test-key"),
      db.client.get("test-key-2"),
    ]);
    strictEqual(value1, "test-val");
    strictEqual(value2, "test-val-2");
  });
  it("should discard transaction throws an error", async () => {
    await db.transaction(() => {
      throw new Error("error");
    });

    const [value1, value2] = await Promise.all([
      db.client.get("test-key"),
      db.client.get("test-key-2"),
    ]);
    strictEqual(value1, null);
    strictEqual(value2, null);
  });
});
