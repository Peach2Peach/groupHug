import chai, { expect } from "chai";
import { Response } from "express";
import { describe, it } from "mocha";
import Sinon from "sinon";
import sinonChai from "sinon-chai";
import { markBatchedTransactionAsPending } from "../../cronjobs/batchTransactions/helpers";
import * as getFeeEstimates from "../../src/utils/electrs/getFeeEstimates";
import { addPSBTToQueue, saveBucketStatus } from "../../src/utils/queue";
import { getResult } from "../../src/utils/result";
import { feeEstimates } from "../../test/data/electrsData";
import { psbt1 } from "../../test/data/psbtData";
import {
  requestMock,
  responseMock,
} from "../../test/unit/controllers/expressMocks";
import { getBatchStatusController } from "./getBatchStatusController";
import { GetBatchStatusRequest } from "./types";

chai.use(sinonChai);

describe("getBatchStatusController", () => {
  const participants = 10;
  const maxParticipants = 20;

  beforeEach(async () => {
    await saveBucketStatus({
      participants,
      maxParticipants,
    });
  });

  it("returns batch status of an ongoing batch for given feeRate", async () => {
    Sinon.stub(getFeeEstimates, "getFeeEstimates").resolves(
      getResult(feeEstimates),
    );
    const request = requestMock({ query: { feeRate: "1" } });
    const response = responseMock();
    await getBatchStatusController(
      request as GetBatchStatusRequest,
      response as Response,
    );

    expect(response.json).to.be.calledWith({
      participants,
      maxParticipants,
      timeRemaining: -2,
      completed: false,
    });
  });
  it("returns batch status of an ongoing batch for given psbt id", async () => {
    const result = await addPSBTToQueue(psbt1, 1);
    Sinon.stub(getFeeEstimates, "getFeeEstimates").resolves(
      getResult(feeEstimates),
    );
    const request = requestMock({ query: { id: result.getResult()!.id } });
    const response = responseMock();
    await getBatchStatusController(
      request as GetBatchStatusRequest,
      response as Response,
    );

    expect(response.json).to.be.calledWith({
      participants,
      maxParticipants,
      timeRemaining: -2,
      completed: false,
    });
  });
  it("returns batch status of an completed batch for given psbt id", async () => {
    const txId = "txId";
    const result = await addPSBTToQueue(psbt1, 1);
    await markBatchedTransactionAsPending([{ psbt: psbt1, feeRate: 1 }], txId);
    Sinon.stub(getFeeEstimates, "getFeeEstimates").resolves(
      getResult(feeEstimates),
    );
    const request = requestMock({ query: { id: result.getResult()!.id } });
    const response = responseMock();
    await getBatchStatusController(
      request as GetBatchStatusRequest,
      response as Response,
    );

    expect(response.json).to.be.calledWith({
      participants: 1,
      maxParticipants: 1,
      timeRemaining: 0,
      completed: true,
      txId,
    });
  });
  it("returns not found if psbt could not be found for given id", async () => {
    Sinon.stub(getFeeEstimates, "getFeeEstimates").resolves(
      getResult(feeEstimates),
    );
    const request = requestMock({ query: { id: "unknown" } });
    const response = responseMock();
    await getBatchStatusController(
      request as GetBatchStatusRequest,
      response as Response,
    );

    expect(response.status).to.be.calledWith(404);
    expect(response.json).to.be.calledWith({ error: "NOT_FOUND" });
  });
});
