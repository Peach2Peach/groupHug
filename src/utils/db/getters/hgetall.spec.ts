import { deepStrictEqual } from "assert";
import { describe, it } from "mocha";
import { db } from "..";
import { complexVal } from "../../../../test/data/primitiveData";

describe("hgetall", () => {
  it("should get a hash object from database", async () => {
    await db.transaction(async (client) => {
      await client.hset("test-hm-key-2", complexVal);
    });
    deepStrictEqual(await db.hgetall("test-hm-key-2"), complexVal);
  });
  it("should get a return null if no entry is in database", async () => {
    deepStrictEqual(await db.hgetall("test-hm-key-2"), null);
  });
});
