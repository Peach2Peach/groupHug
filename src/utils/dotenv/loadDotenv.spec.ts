import chai, { expect } from "chai";
import dotenv from "dotenv";
import Sinon, { SinonStub } from "sinon";
import { loadDotenv } from "./loadDotenv";
import * as parseArgv from "./parseArgv";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

describe("loadDotenv", () => {
  let dotenvStub: SinonStub;
  beforeEach(() => {
    dotenvStub = Sinon.stub(dotenv, "config");
  });
  afterEach(() => {
    Sinon.restore();
  });
  it("loads dotenv without option if no dotenvFile is given", () => {
    Sinon.stub(parseArgv, "parseArgv").returns({});
    loadDotenv();
    expect(dotenvStub).to.have.been.calledWith();
  });
  it("loads dotenv with path if dotenvFile is given", () => {
    Sinon.stub(parseArgv, "parseArgv").returns({ dotenvFile: "path" });
    loadDotenv();
    expect(dotenvStub).to.have.been.calledWith({ path: "path" });
  });
});
