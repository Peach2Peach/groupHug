import chai, { expect } from "chai";
import sinonChai from "sinon-chai";
import { db } from "..";

chai.use(sinonChai);

describe("zincrby", () => {
  it("should increment the score of member ", async () => {
    await db.transaction(async (client) => {
      await client.zadd("test-zincrby-key", 1, "A");
    });

    expect(await db.zincrby("test-zincrby-key", 3, "A")).to.equal(4);
  });
});
