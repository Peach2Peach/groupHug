/* eslint-disable prefer-destructuring */
import chai, { expect } from "chai";
import { Request, Response } from "express";
import { describe, it } from "mocha";
import Sinon from "sinon";
import sinonChai from "sinon-chai";
import { sha256 } from "../../../src/utils/crypto/sha256";
import { db } from "../../../src/utils/db";
import { KEYS } from "../../../src/utils/db/keys";
import { registerPSBTWithClient } from "../../../src/utils/queue/registerPSBTWithClient";
import { psbt1, psbtBase64_1 } from "../../../test/data/psbtData";
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
    const { result } = await db.transaction((client) =>
      registerPSBTWithClient(client, psbtBase64_1),
    );
    if (!result) throw new Error("Result should not be null");
    id = result.id;
    revocationToken = result.revocationToken;
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
    await db.client.del(KEYS.PSBT.PREFIX + sha256(psbt1.toBase64()));
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
