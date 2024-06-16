import { strictEqual } from "assert";
import { describe, it } from "mocha";
import { db } from "..";

describe("get", () => {
  it("should get a value from database", async () => {
    await db.transaction(async (client) => {
      await client.set("test-key", "test-val");
    });
    strictEqual(await db.get("test-key"), "test-val");
  });
  it("should return null for nonexisting entries", async () => {
    strictEqual(await db.get("idontreallyexist"), null);
  });
});
