import { strictEqual } from "assert";
import { describe, it } from "mocha";
import { db } from "..";

describe("incr", () => {
  it("should return increased counter", async () => {
    strictEqual(await db.incr("test-incr"), 1);
    strictEqual(await db.incr("test-incr"), 2);
    strictEqual(await db.incr("test-incr"), 3);
  });
});
