import { networks, Psbt } from "bitcoinjs-lib";
import chai, { expect } from "chai";
import { Request, Response } from "express";
import { describe, it } from "mocha";
import Sinon from "sinon";
import sinonChai from "sinon-chai";
import * as constants from "../../../constants";
import * as signAllInputs from "../../../src/utils/psbt";
import {
  batchQueue,
  missingSignature,
  psbtWith2ndInput,
  psbtWith2ndOutput,
  validEntryPSBTBase64,
  wrongSighash,
} from "../../../test/data/psbtData";
import {
  requestMock,
  responseMock,
} from "../../../test/unit/controllers/expressMocks";
import { validatePSBT } from "./validatePSBT";

chai.use(sinonChai);

describe("validatePSBT", () => {
  const highFeePsbt = batchQueue[batchQueue.length - 1];

  it("validates psbt successfully", () => {
    const request = requestMock({
      body: batchQueue[0],
    });
    const response = responseMock();
    const next = Sinon.stub();

    validatePSBT(request as Request, response as Response, next);

    expect(next).to.have.been.called;
  });
  it("doesn't sign all inputs if index is not provided", () => {
    const request = requestMock({
      body: { psbt: validEntryPSBTBase64 },
    });
    const response = responseMock();
    const next = Sinon.stub();
    const signAllInputsStub = Sinon.stub(signAllInputs, "signAllInputs");

    validatePSBT(request as Request, response as Response, next);

    expect(signAllInputsStub).not.to.have.been.called;
    expect(next).to.have.been.called;
  });

  it("returns error if psbt is not of type string", () => {
    const request = requestMock({
      body: { psbt: 0, index: 0 },
    });

    const response = responseMock();
    const next = Sinon.stub();

    validatePSBT(request as Request, response as Response, next);

    expect(next).not.to.have.been.called;
    expect(response.status).to.have.been.calledWith(400);
    expect(response.json).to.have.been.calledWith({
      details: "",
      error: "BAD_REQUEST",
    });
  });
  it("returns error if psbt has no signature", () => {
    const request = requestMock({
      body: { psbt: missingSignature, index: 0 },
    });

    const response = responseMock();
    const next = Sinon.stub();

    validatePSBT(request as Request, response as Response, next);

    expect(next).not.to.have.been.called;
    expect(response.status).to.have.been.calledWith(400);
    expect(response.json).to.have.been.calledWith({
      details: "SIGNATURE_INVALID",
      error: "BAD_REQUEST",
    });
  });
  it("returns error if psbt has wrong signature", () => {
    const wrongSig = Psbt.fromBase64(missingSignature, {
      network: networks.regtest,
    });
    wrongSig.data.inputs[0].finalScriptSig = Buffer.from("0");
    const request = requestMock({
      body: { psbt: wrongSig.toBase64(), index: 0 },
    });

    const response = responseMock();
    const next = Sinon.stub();

    validatePSBT(request as Request, response as Response, next);

    expect(next).not.to.have.been.called;
    expect(response.status).to.have.been.calledWith(400);
    expect(response.json).to.have.been.calledWith({
      details: "SIGNATURE_INVALID",
      error: "BAD_REQUEST",
    });
  });
  it("returns error if psbt has wrong sighash", () => {
    const request = requestMock({
      body: { psbt: wrongSighash, index: 0 },
    });

    const response = responseMock();
    const next = Sinon.stub();

    validatePSBT(request as Request, response as Response, next);

    expect(next).not.to.have.been.called;
    expect(response.status).to.have.been.calledWith(400);
    expect(response.json).to.have.been.calledWith({
      details: "WRONG_SIGHASH",
      error: "BAD_REQUEST",
    });
  });
  it("returns error if psbt is invalid", () => {
    const request = requestMock({
      body: { psbt: "invalid base64", index: 0 },
    });

    const response = responseMock();
    const next = Sinon.stub();

    validatePSBT(request as Request, response as Response, next);

    expect(next).not.to.have.been.called;
    expect(response.status).to.have.been.calledWith(400);
    expect(response.json).to.have.been.calledWith({
      details: "",
      error: "BAD_REQUEST",
    });
  });
  it("returns error if psbt has more than 2 inputs", () => {
    const request = requestMock({
      body: { psbt: psbtWith2ndInput, index: 0 },
    });

    const response = responseMock();
    const next = Sinon.stub();

    validatePSBT(request as Request, response as Response, next);

    expect(next).not.to.have.been.called;
    expect(response.status).to.have.been.calledWith(400);
    expect(response.json).to.have.been.calledWith({
      details: "INVALID_INPUTS",
      error: "BAD_REQUEST",
    });
  });
  it("returns error if psbt has more than 2 outputs", () => {
    const request = requestMock({
      body: { psbt: psbtWith2ndOutput, index: 0 },
    });

    const response = responseMock();
    const next = Sinon.stub();

    validatePSBT(request as Request, response as Response, next);

    expect(next).not.to.have.been.called;
    expect(response.status).to.have.been.calledWith(400);
    expect(response.json).to.have.been.calledWith({
      details: "INVALID_OUTPUTS",
      error: "BAD_REQUEST",
    });
  });
  it("returns error if fee rate less than the minimum fee rate", () => {
    Sinon.stub(constants, "MINIMUM_FEE_RATE").get(() => 27);
    const request = requestMock({
      body: batchQueue[0],
    });
    const response = responseMock();
    const next = Sinon.stub();

    validatePSBT(request as Request, response as Response, next);

    expect(next).not.to.have.been.called;
    expect(response.status).to.have.been.calledWith(400);
    expect(response.json).to.have.been.calledWith({
      details: "INVALID_FEE_RATE",
      feeRate: 26,
      finalFeeRate: 26,
      error: "BAD_REQUEST",
    });
  });
  it("validates psbt successfully if desired fee rate is below actual fee rate (donation)", () => {
    const request = requestMock({
      body: highFeePsbt,
    });
    const response = responseMock();
    const next = Sinon.stub();

    validatePSBT(request as Request, response as Response, next);

    expect(next).to.have.been.called;
  });
});
