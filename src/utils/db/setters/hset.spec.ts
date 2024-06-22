import { deepStrictEqual } from "assert";
import { expect } from "chai";
import { describe, it } from "mocha";
import { db } from "..";
import {
  complexVal,
  complexValWithFalseValues,
} from "../../../../test/data/primitiveData";

describe("hset", () => {
  it("should hset a value to database with expiration date", async () => {
    await db.transaction(async (client) => {
      await client.hset("expiring-hm-key", complexVal, 4000);
    });
    expect(await db.client.hGetAll("expiring-hm-key")).to.deep.equal(
      complexVal,
    );
    deepStrictEqual(await db.client.ttl("expiring-hm-key"), 4);
  });

  it("should set a object as hashmap to database", async () => {
    await db.transaction(async (client) => {
      await client.hset("test-hm-key", complexVal);
    });
    expect(await db.client.hGetAll("test-hm-key")).to.deep.equal(complexVal);
  });

  it("should set a subkey of hashmap to database", async () => {
    await db.transaction(async (client) => {
      await client.hset("test-hm-key", complexVal);
      await client.hset("test-hm-key", {
        subKey2: "overwritten-val",
      });
    });
    deepStrictEqual(
      await db.client.hmGet("test-hm-key", ["subKey", "subKey2", "object.key"]),
      ["test-val", "overwritten-val", "subkey val"],
    );
  });
  it("should set values to database that are also false or 0", async () => {
    await db.transaction(async (client) => {
      await client.hset("test-hm-key-false", complexValWithFalseValues);
    });

    deepStrictEqual(
      await db.client.hmGet("test-hm-key-false", "falseBoolean"),
      ["false"],
    );
    deepStrictEqual(await db.client.hmGet("test-hm-key-false", ["zeroValue"]), [
      "0",
    ]);
  });
});
