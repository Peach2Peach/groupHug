import chai, { expect } from "chai";
import { Request, Response } from "express";
import { describe, it } from "mocha";
import Sinon from "sinon";
import sinonChai from "sinon-chai";
import {
  requestMock,
  responseMock,
} from "../test/unit/controllers/expressMocks";
import { addResponseHeaders } from "./addResponseHeaders";

chai.use(sinonChai);

describe("addResponseHeaders", () => {
  it("sets response headers accordingly", () => {
    const nextSpy = Sinon.spy();
    const request = requestMock();
    const response = responseMock();

    addResponseHeaders({
      "Cache-control": "no-store",
    })(request as Request, response as Response, nextSpy);

    expect(response.set).to.be.calledWith("Cache-control", "no-store");
    expect(nextSpy).to.be.calledWith();
  });
});
