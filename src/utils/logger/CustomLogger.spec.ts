import { expect } from "chai";
import Sinon from "sinon";
import winston, { Logger } from "winston";
import { CustomLogger } from "./CustomLogger";

describe("CustomLogger", () => {
  let existingLogger: Logger;
  let winstonHasStub: Sinon.SinonStub;
  let winstonGetStub: Sinon.SinonStub;
  let winstonAddStub: Sinon.SinonStub;

  beforeEach(() => {
    winstonHasStub = Sinon.stub(winston.loggers, "has").callThrough();
    winstonGetStub = Sinon.stub(winston.loggers, "get").callThrough();
    winstonAddStub = Sinon.stub(winston.loggers, "add").callThrough();
  });
  afterEach(() => {
    Sinon.restore();
  });

  it("should create a new logger if it does not exist", () => {
    existingLogger = CustomLogger("category", "name", "debug");

    expect(existingLogger).to.exist;
    expect(existingLogger.level).to.equal("debug");
    expect(winstonHasStub.calledOnceWithExactly("category-name")).to.be.true;
    expect(winstonAddStub.calledOnce).to.be.true;
    expect(winstonAddStub.getCall(0).args[0]).to.equal("category-name");
  });
  it("should return an existing logger if it already exists", () => {
    const logger = CustomLogger("category", "name");

    expect(logger).to.equal(existingLogger);
    expect(winstonGetStub.calledOnceWithExactly("category-name")).to.be.true;
  });
});
