import chai, { expect } from "chai";
import sinonChai from "sinon-chai";
import { db } from "..";

chai.use(sinonChai);

describe("zrem", () => {
  it("should remove a member ", async () => {
    await db.transaction(async (client) => {
      await Promise.all([
        client.zadd("test-zrem-key", 1, "A"),
        client.zadd("test-zrem-key", 3, "B"),
      ]);
      await client.zrem("test-zrem-key", "B");
    });

    expect(await db.zcard("test-zrem-key")).to.equal(1);
  });
});
