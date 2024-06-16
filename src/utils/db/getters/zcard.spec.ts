import chai, { expect } from "chai";
import sinonChai from "sinon-chai";
import { db } from "..";

chai.use(sinonChai);

describe("zcard", () => {
  beforeEach(async () => {
    await db.transaction(async (client) => {
      await Promise.all([
        client.zadd("test-zcard-key", 1, "A"),
        client.zadd("test-zcard-key", 2, "B"),
        client.zadd("test-zcard-key", 3, "C"),
        client.zadd("test-zcard-key", 4, "D"),
        client.zadd("test-zcard-key", 5, "E"),
      ]);
    });
  });
  it("should count number of all members", async () => {
    expect(await db.zcard("test-zcard-key")).to.equal(5);
  });
});
