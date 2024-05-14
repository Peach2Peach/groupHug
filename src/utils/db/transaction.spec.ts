import chai, { expect } from "chai";
import { describe, it } from "mocha";
import Sinon from "sinon";
import sinonChai from "sinon-chai";
import { db } from ".";

chai.use(sinonChai);

describe("transaction", () => {
  afterEach(() => {
    Sinon.restore();
  });
  it("should execute transaction and return transaction result", async () => {
    const { result, ok } = await db.transaction(async (client) => {
      await client.set("test", 1);
      return "myResult";
    });
    expect(ok).to.be.true;
    expect(result).to.equal("myResult");
    expect(await db.get("test")).to.equal("1");
  });
  it("should handle errors", async () => {
    const { error } = await db.transaction(() => {
      throw new Error("error");
    });
    expect(error).to.equal("transaction aborted");
  });
});
