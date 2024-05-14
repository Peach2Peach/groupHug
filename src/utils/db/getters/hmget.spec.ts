import { deepStrictEqual } from "assert";
import { describe, it } from "mocha";
import { db } from "..";
import { complexVal } from "../../../../test/data/primitiveData";

describe("hmget", () => {
  it("should get a hash value from database", async () => {
    await db.transaction(async (client) => {
      await client.hset("test-hm-key", complexVal);
    });

    deepStrictEqual(await db.hmget("test-hm-key", "subKey"), ["test-val"]);
    deepStrictEqual(await db.hmget("test-hm-key", ["subKey2"]), [
      "another-val",
    ]);
    deepStrictEqual(await db.hmget("test-hm-key", ["subKey", "subKey2"]), [
      "test-val",
      "another-val",
    ]);
  });
});
