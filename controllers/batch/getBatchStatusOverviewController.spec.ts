import chai, { expect } from "chai";
import { Response } from "express";
import { describe, it } from "mocha";
import sinonChai from "sinon-chai";
import { addPSBTToQueue } from "../../src/utils/queue/addPSBTToQueue";
import { psbt1 } from "../../test/data/psbtData";
import {
  requestMock,
  responseMock,
} from "../../test/unit/controllers/expressMocks";
import { getBatchStatusOverviewController } from "./getBatchStatusOverviewController";

chai.use(sinonChai);

describe("getBatchStatusOverviewController", () => {
  it("returns batch status of an ongoing batches", async () => {
    await addPSBTToQueue(psbt1);
    const request = requestMock();
    const response = responseMock();
    await getBatchStatusOverviewController(
      request as Parameters<typeof getBatchStatusOverviewController>[0],
      response as Response,
    );

    expect(response.json).to.be.calledWith({
      participants: 1,
      maxParticipants: 1,
      transactionsInQueue: 1,
      timeRemaining: -2,
      minimumWaitTime: -2,
      maximumWaitTime: -2,
      completed: false,
    });
  });
});
