import { expect } from "chai";
import { describe, it } from "mocha";
import { db } from "..";

describe("keys", () => {
  it("should return keys for query", async () => {
    await db.transaction(async (client) => {
      await Promise.all([
        client.set("test-key", "test-val"),
        client.set("test-key2", "test-val"),
      ]);
    });
    const result = await db.keys("test-*");
    expect(result.length).to.equal(2);
    expect(result).to.include("test-key");
    expect(result).to.include("test-key2");
  });
  it("should return ampty array for nonexisting entries", async () => {
    expect(await db.keys("idontreallyexist")).to.deep.equal([]);
  });
});
