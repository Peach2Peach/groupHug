import { ok } from "assert";
import { db } from "..";
import sinon, { SinonStub } from "sinon";

describe("exists", () => {
  let existsStub: SinonStub;

  before(() => {
    existsStub = sinon.stub(db.client, "exists");
  });

  after(() => {
    existsStub.restore();
  });
  afterEach(() => {
    existsStub.reset();
  });

  it("should return true if key exists", async () => {
    const key = "testKey";
    existsStub.resolves(1);

    const result = await db.exists(key);

    ok(result);
  });

  it("should return false if key does not exist", async () => {
    const key = "testKey";
    existsStub.resolves(0);

    const result = await db.exists(key);

    ok(!result);
  });
});
