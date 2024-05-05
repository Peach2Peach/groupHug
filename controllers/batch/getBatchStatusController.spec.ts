import chai, { expect } from "chai";
import { Response } from "express";
import { describe, it } from "mocha";
import Sinon from "sinon";
import sinonChai from "sinon-chai";
import { addPSBTToBatchWithClient } from "../../src/utils/batch/addPSBTToBatchWithClient";
import { db } from "../../src/utils/db";
import { KEYS } from "../../src/utils/db/keys";
import * as getFeeEstimates from "../../src/utils/electrs/getFeeEstimates";
import { addPSBTToQueue } from "../../src/utils/queue/addPSBTToQueue";
import { feeEstimates } from "../../test/data/electrsData";
import { psbt1 } from "../../test/data/psbtData";
import {
  requestMock,
  responseMock,
} from "../../test/unit/controllers/expressMocks";
import { getBatchStatusController } from "./getBatchStatusController";

chai.use(sinonChai);

describe("getBatchStatusController", () => {
  it("returns batch status of an ongoing batch for given psbt id", async () => {
    const result = await addPSBTToQueue(psbt1, 1);
    const request = requestMock({ query: { id: result.getResult()!.id } });
    const response = responseMock();
    // @ts-ignore
    await getBatchStatusController(request, response as Response);

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
  it("returns batch status of a completed batch for given psbt id", async () => {
    const txId = "txId";
    const result = await addPSBTToQueue(psbt1, 1);
    await db.transaction(async (client) => {
      await addPSBTToBatchWithClient(client, txId, psbt1.toBase64());
      await client.srem(KEYS.PSBT.QUEUE, psbt1.toBase64());
    });
    Sinon.stub(getFeeEstimates, "getFeeEstimates").resolves({
      result: feeEstimates,
    });
    const request = requestMock({ query: { id: result.getResult()!.id } });
    const response = responseMock();
    // @ts-ignore
    await getBatchStatusController(request, response as Response);

    expect(response.json).to.be.calledWith({
      participants: 1,
      maxParticipants: 1,
      timeRemaining: 0,
      completed: true,
      txId,
    });
  });
});
