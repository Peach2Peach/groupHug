import { expect } from "chai";
import Sinon from "sinon";
import * as constants from "../../../constants";
import { getLogLevels } from "./logLevels";

describe("getLogLevel", () => {
  it("should return an empty object by default", () => {
    Sinon.stub(constants, "LOGLEVEL_ERROR").get(() => undefined);
    Sinon.stub(constants, "LOGLEVEL_WARN").get(() => undefined);
    Sinon.stub(constants, "LOGLEVEL_HTTP").get(() => undefined);
    Sinon.stub(constants, "LOGLEVEL_INFO").get(() => undefined);
    Sinon.stub(constants, "LOGLEVEL_DEBUG").get(() => undefined);
    expect(getLogLevels()).to.deep.equal({});
  });

  it("should return the log level for a specific category and name", () => {
    Sinon.stub(constants, "LOGLEVEL_ERROR").get(() => "category-error");
    Sinon.stub(constants, "LOGLEVEL_WARN").get(() => "category-warn,category");
    Sinon.stub(constants, "LOGLEVEL_HTTP").get(() => "category-http");
    Sinon.stub(constants, "LOGLEVEL_INFO").get(() => "category-info");
    Sinon.stub(constants, "LOGLEVEL_DEBUG").get(() => "category-debug");

    expect(getLogLevels()).to.deep.equal({
      "category-error": "error",
      "category-warn": "warn",
      category: "warn",
      "category-http": "http",
      "category-info": "info",
      "category-debug": "debug",
    });
  });
});
