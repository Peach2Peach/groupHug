import { expect } from "chai";
import { db } from "../utils/db";
import { KEYS } from "../utils/db/keys";
import { getUnusedFeeAddress } from "./getUnusedFeeAddress";

describe("getUnusedFeeAddress", () => {
  it("returns address of index 0 if none has been used yet", async () => {
    expect(await getUnusedFeeAddress()).to.equal(
      "bcrt1qupfa6jeus78n0ur28aun8fpm7aglj2a57em865",
    );
  });
  it("returns latest unused fee address", async () => {
    await db.transaction(async (client) => {
      await client.incr(KEYS.FEE.INDEX);
    });
    expect(await getUnusedFeeAddress()).to.equal(
      "bcrt1qkpwzl5hpxgl8eaatk3n40tl02fkr776xwz0aeg",
    );
    expect(await getUnusedFeeAddress()).to.equal(
      "bcrt1qtl0a0334wp4prsuxwva08xx274ttqhg7vxxarf",
    );
  });
});
