import { strictEqual } from "assert";
import { describe, it } from "mocha";
import { db } from "..";

describe("scard", () => {
  it("should return set cardinality (number of elements)", async () => {
    await db.transaction(async (client) => {
      await client.sadd("test-set", ["1", "2"]);
    });
    strictEqual(await db.scard("test-set"), 2);
  });
});
