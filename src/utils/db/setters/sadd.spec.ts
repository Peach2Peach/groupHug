import { expect } from "chai";
import { describe, it } from "mocha";
import { db } from "..";

describe("sadd", () => {
  it("should add a member to a set", async () => {
    await db.transaction(async (client) => {
      await client.sadd("test-set-key", "1");
    });

    expect(await db.client.sMembers("test-set-key")).to.deep.equal(["1"]);

    await db.transaction(async (client) => {
      await Promise.all([
        client.sadd("test-set-key", "a"),
        client.sadd("test-set-key", "b"),
      ]);
    });

    const entry = await db.client.sMembers("test-set-key");
    expect(entry.length).to.equal(3);
    expect(entry.indexOf("1")).not.to.equal(-1);
    expect(entry.indexOf("a")).not.to.equal(-1);
    expect(entry.indexOf("b")).not.to.equal(-1);
  });
  it("should add multiple members to a set", async () => {
    const members = ["1", "2"];
    await db.transaction(async (client) => {
      await client.sadd("test-set-key", members);
    });

    expect(await db.client.sMembers("test-set-key")).to.deep.equal(members);
  });
});
