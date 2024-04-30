import chai, { expect } from "chai";
import { Response } from "express";
import { describe, it } from "mocha";
import Sinon from "sinon";
import sinonChai from "sinon-chai";
import * as getFeeEstimates from "../../src/utils/electrs/getFeeEstimates";
import { saveBucketStatus } from "../../src/utils/queue";
import { feeEstimates } from "../../test/data/electrsData";
import {
  requestMock,
  responseMock,
} from "../../test/unit/controllers/expressMocks";
import { getBatchStatusOverviewController } from "./getBatchStatusOverviewController";
import { GetBatchStatusRequest } from "./types";

chai.use(sinonChai);

describe("getBatchStatusOverviewController", () => {
  const participants = 10;
  const maxParticipants = 20;

  beforeEach(async () => {
    await Promise.all([saveBucketStatus({ participants, maxParticipants })]);
  });

  it("returns batch status of an ongoing batches", async () => {
    Sinon.stub(getFeeEstimates, "getFeeEstimates").resolves({
      result: feeEstimates,
    });
    const request = requestMock();
    const response = responseMock();
    await getBatchStatusOverviewController(
      request as GetBatchStatusRequest,
      response as Response
    );

    expect(response.json).to.be.calledWith({
      participants,
      maxParticipants,
      timeRemaining: -2,
      completed: false,
    });
  });
});
