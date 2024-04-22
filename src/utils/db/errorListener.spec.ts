import chai, { expect } from "chai";
import sinonChai from "sinon-chai";
import { errorListener } from "./errorListener";
import Sinon from "sinon";
import { dbLogger } from "./dbLogger";
chai.use(sinonChai);

describe("errorListener", () => {
  let errorStub: Sinon.SinonStub;
  before(() => {
    errorStub = Sinon.stub(dbLogger, "error");
  });
  after(() => {
    Sinon.restore();
  });
  it("logs error", () => {
    const error = new Error("error");
    errorListener(error);
    expect(errorStub).to.have.been.calledWith(["Redis Client Error", error]);
  });
});
