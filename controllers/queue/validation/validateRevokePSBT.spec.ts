/* eslint-disable prefer-destructuring */
import chai, { expect } from "chai";
import { Request, Response } from "express";
import { describe, it } from "mocha";
import Sinon from "sinon";
import sinonChai from "sinon-chai";
import { registerPSBT, unregisterPSBT } from "../../../src/utils/queue";
import { psbt1 } from "../../../test/data/psbtData";
import {
  requestMock,
  responseMock,
} from "../../../test/unit/controllers/expressMocks";
import { validateRevokePSBT } from "./validateRevokePSBT";

chai.use(sinonChai);

describe("validateRevokePSBT", () => {
  let id: string;
  let revocationToken: string;
  beforeEach(async () => {
    const result = await registerPSBT(psbt1);
    id = result.getResult().id;
    revocationToken = result.getResult().revocationToken;
  });

  it("validates revocation request successfully", async () => {
    const request = requestMock({ body: { id, revocationToken } });
    const response = responseMock();
    const next = Sinon.stub();

    await validateRevokePSBT(request as Request, response as Response, next);

    expect(next).to.have.been.called;
  });

  it("returns error if id is not a sha256 hash", async () => {
    const request = requestMock({
      body: { id: "somethingelse", revocationToken },
    });

    const response = responseMock();
    const next = Sinon.stub();

    await validateRevokePSBT(request as Request, response as Response, next);

    expect(next).not.to.have.been.called;
    expect(response.status).to.have.been.calledWith(400);
    expect(response.json).to.have.been.calledWith({ error: "BAD_REQUEST" });
  });
  it("returns error revocation token is not a token", async () => {
    const request = requestMock({
      body: { id, revocationToken: "somethingelse" },
    });

    const response = responseMock();
    const next = Sinon.stub();

    await validateRevokePSBT(request as Request, response as Response, next);

    expect(next).not.to.have.been.called;
    expect(response.status).to.have.been.calledWith(400);
    expect(response.json).to.have.been.calledWith({ error: "BAD_REQUEST" });
  });
  it("returns error if id does not exist", async () => {
    await unregisterPSBT(psbt1);
    const request = requestMock({ body: { id, revocationToken } });

    const response = responseMock();
    const next = Sinon.stub();

    await validateRevokePSBT(request as Request, response as Response, next);

    expect(next).not.to.have.been.called;
    expect(response.status).to.have.been.calledWith(400);
    expect(response.json).to.have.been.calledWith({ error: "BAD_REQUEST" });
  });
  it("returns error if revocation token does not match", async () => {
    const request = requestMock({
      body: { id, revocationToken: "f6339d1a59a14ab1bc5960a479e106d9" },
    });

    const response = responseMock();
    const next = Sinon.stub();

    await validateRevokePSBT(request as Request, response as Response, next);

    expect(next).not.to.have.been.called;
    expect(response.status).to.have.been.calledWith(400);
    expect(response.json).to.have.been.calledWith({ error: "BAD_REQUEST" });
  });
});
