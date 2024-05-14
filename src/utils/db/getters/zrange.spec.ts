import chai, { expect } from "chai";
import sinon, { SinonSpy } from "sinon";
import sinonChai from "sinon-chai";
import { db } from "..";

chai.use(sinonChai);

describe("zrange", () => {
  let zRangeSpy: SinonSpy;

  beforeEach(async () => {
    await db.transaction(async (client) => {
      await Promise.all([
        client.zadd("test-zrange-key", 1, "A"),
        client.zadd("test-zrange-key", 2, "B"),
        client.zadd("test-zrange-key", 3, "C"),
        client.zadd("test-zrange-key", 4, "D"),
      ]);
    });
    zRangeSpy = sinon.spy(db.client, "zRange");
  });

  afterEach(() => {
    zRangeSpy.restore();
  });

  it("should call zRange with default values", async () => {
    const result = await db.zrange("test-zrange-key");
    expect(result).to.deep.equal(["A", "B", "C", "D"]);
    expect(zRangeSpy).to.have.been.calledWith(
      "test-zrange-key",
      "-inf",
      "+inf",
      {
        BY: "SCORE",
        LIMIT: undefined,
        REV: undefined,
      },
    );
  });

  it("should call zRange with custom values", async () => {
    const result = await db.zrange("test-zrange-key", 2, 3, true, true, 1, 1);
    expect(result).to.deep.equal(["B"]);
    expect(zRangeSpy).to.have.been.calledWith("test-zrange-key", "3", "2", {
      BY: "SCORE",
      LIMIT: { offset: 1, count: 1 },
      REV: true,
    });
  });
  it("should call zRange with without score", async () => {
    const result = await db.zrange("test-zrange-key", 0, 1, false);
    expect(result).to.deep.equal(["A", "B"]);
    expect(zRangeSpy).to.have.been.calledWith("test-zrange-key", "0", "1", {
      BY: undefined,
      LIMIT: undefined,
      REV: undefined,
    });
  });

  it("should call zRange to get the element with higher score", async () => {
    const result = await db.zrange(
      "test-zrange-key",
      "-inf",
      "+inf",
      true,
      true,
      0,
      1,
    );
    expect(result).to.deep.equal(["D"]);
    expect(zRangeSpy).to.have.been.calledWith(
      "test-zrange-key",
      "+inf",
      "-inf",
      {
        BY: "SCORE",
        LIMIT: { offset: 0, count: 1 },
        REV: true,
      },
    );
  });
});
