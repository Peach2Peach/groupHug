import { expect } from "chai";
import Sinon from "sinon";
import * as constants from "../../../constants";
import { getLogLevel } from "./getLogLevel";

describe("getLogLevel", () => {
  beforeEach(() => {
    Sinon.stub(constants, "NODE_ENV").get(() => "development");
    Sinon.stub(constants, "LOGLEVEL_ERROR").get(() => "category-error");
    Sinon.stub(constants, "LOGLEVEL_WARN").get(() => "category-warn,category");
    Sinon.stub(constants, "LOGLEVEL_HTTP").get(() => "category-http");
    Sinon.stub(constants, "LOGLEVEL_INFO").get(() => "category-info");
    Sinon.stub(constants, "LOGLEVEL_DEBUG").get(() => "category-debug");
  });
  afterEach(() => {
    Sinon.restore();
  });
  it("should return the log level for a specific category and name", () => {
    expect(getLogLevel("category", "http")).to.equal("http");
  });
  it("should return the log level for a specific category", () => {
    expect(getLogLevel("category", undefined, "info")).to.equal("warn");
  });
  it("should return the provided fallback level if category and name are not specified", () => {
    expect(getLogLevel(undefined, undefined, "info")).to.equal("info");
  });
  it("should return default level if category does not match and fallback level is provided", () => {
    expect(getLogLevel("otherCategory", "name")).to.equal("info");
  });
});
