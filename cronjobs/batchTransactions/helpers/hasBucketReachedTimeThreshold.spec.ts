import { expect } from "chai";
import { db } from "../../../src/utils/db";
import { KEYS } from "../../../src/utils/db/keys";
import { hasBucketReachedTimeThreshold } from "./hasBucketReachedTimeThreshold";

describe("hasBucketReachedTimeThreshold", () => {
  it("returns true if the bucket index cannot be found in the database", async () => {
    expect(await hasBucketReachedTimeThreshold()).to.be.true;
  });
  it("returns true if the bucket index can be found in the database", async () => {
    await db.transaction((client) =>
      client.set(KEYS.BUCKET.EXPIRATION, true, 1000),
    );
    expect(await hasBucketReachedTimeThreshold()).to.be.false;
  });
});
