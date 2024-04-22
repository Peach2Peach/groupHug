import { deepStrictEqual } from "assert";
import { describe, it } from "mocha";
import { db } from "..";

describe("sunion", () => {
  it("should return intersection of different sets", async () => {
    await db.transaction(async (client) => {
      await Promise.all([
        client.sadd("test-set-union-1", "1"),
        client.sadd("test-set-union-1", "2"),
        client.sadd("test-set-union-1", "3"),
        client.sadd("test-set-union-2", "3"),
        client.sadd("test-set-union-2", "4"),
        client.sadd("test-set-union-2", "5"),
      ]);
    });
    deepStrictEqual(await db.sunion(["test-set-union-1", "test-set-union-2"]), [
      "1",
      "2",
      "3",
      "4",
      "5",
    ]);
  });
});
