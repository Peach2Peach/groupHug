import { ok } from "assert";
import { describe, it } from "mocha";
import { db } from "..";

describe("sinter", () => {
  it("should return intersection of different sets", async () => {
    await db.transaction(async (client) => {
      await Promise.all([
        client.sadd("test-set-intersect-1", "1"),
        client.sadd("test-set-intersect-1", "2"),
        client.sadd("test-set-intersect-1", "3"),
        client.sadd("test-set-intersect-2", "3"),
        client.sadd("test-set-intersect-2", "4"),
        client.sadd("test-set-intersect-2", "5"),
      ]);
    });
    ok(await db.sinter(["test-set-intersect-1", "test-set-intersect-2"]), "3");
  });
});
