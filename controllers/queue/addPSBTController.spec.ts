import { Psbt, networks } from "bitcoinjs-lib";
import chai, { expect } from "chai";
import { Response } from "express";
import { describe, it } from "mocha";
import Sinon, { SinonStub } from "sinon";
import sinonChai from "sinon-chai";
import { db } from "../../src/utils/db";
import { TransactionResult } from "../../src/utils/db/TransactionResult";
import { KEYS } from "../../src/utils/db/keys";
import { getPSBTsFromQueue } from "../../src/utils/queue";
import * as addPSBTToQueue from "../../src/utils/queue/addPSBTToQueue";
import blockExplorerData from "../../test/data/blockExplorerData.json";
import { batchQueue } from "../../test/data/psbtData";
import {
  requestMock,
  responseMock,
} from "../../test/unit/controllers/expressMocks";
import { mockGetTx } from "../../test/unit/helpers/mockGetTx";
import { addPSBTController } from "./addPSBTController";
import { AddPSBTRequest } from "./types";
import { getTxIdOfInput } from "../../src/utils/psbt";

chai.use(sinonChai);

describe("addPSBTController", () => {
  const confirmedTx = {
    ...blockExplorerData.tx,
    vout: [blockExplorerData.tx.vout[0]],
  };
  const unConfirmedTx = { ...confirmedTx, status: { confirmed: false } };

  afterEach(() => {
    Sinon.restore();
  });
  it("accepts psbt and stores it in the queue with correct fee rate", async () => {
    const psbt = Psbt.fromBase64(batchQueue[0].psbt, {
      network: networks.regtest,
    });
    mockGetTx(getTxIdOfInput(psbt.txInputs[0]), confirmedTx);
    const request = requestMock({
      body: { psbt: batchQueue[0].psbt, feeRate: batchQueue[0].feeRate },
    });
    const response = responseMock();

    await addPSBTController(request as AddPSBTRequest, response as Response);

    expect(await getPSBTsFromQueue()).to.deep.include({
      psbt,
      feeRate: batchQueue[0].feeRate,
    });
    expect(response.json).to.be.calledWith({
      id: Sinon.match.string,
      revocationToken: Sinon.match.string,
    });

    const [jsonResponse] = (response.json as SinonStub).getCall(0).args;
    expect(jsonResponse.id.length).to.equal(64);
    expect(jsonResponse.revocationToken.length).to.equal(32);
    expect(await db.hgetall(KEYS.PSBT.PREFIX + jsonResponse.id)).to.deep.equal({
      psbt: batchQueue[0].psbt,
      revocationToken: jsonResponse.revocationToken,
    });
  });
  it("accepts psbt and stores it in the queue with correct fee rate and index", async () => {
    const psbt = Psbt.fromBase64(batchQueue[0].psbt, {
      network: networks.regtest,
    });
    mockGetTx(getTxIdOfInput(psbt.txInputs[0]), confirmedTx);
    const request = requestMock({
      body: batchQueue[0],
    });
    const response = responseMock();

    await addPSBTController(request as AddPSBTRequest, response as Response);

    expect(await getPSBTsFromQueue()).to.deep.include({
      psbt,
      feeRate: batchQueue[0].feeRate,
    });
    expect(response.json).to.be.calledWith({
      id: Sinon.match.string,
      revocationToken: Sinon.match.string,
    });

    const [jsonResponse] = (response.json as SinonStub).getCall(0).args;
    expect(jsonResponse.id.length).to.equal(64);
    expect(jsonResponse.revocationToken.length).to.equal(32);
    expect(await db.hgetall(KEYS.PSBT.PREFIX + jsonResponse.id)).to.deep.equal({
      psbt: batchQueue[0].psbt,
      revocationToken: jsonResponse.revocationToken,
      index: String(batchQueue[0].index),
    });
  });
  it("returns BAD_REQUEST error if inputs are not yet confirmed", async () => {
    const psbt = Psbt.fromBase64(batchQueue[0].psbt, {
      network: networks.regtest,
    });
    mockGetTx(getTxIdOfInput(psbt.txInputs[0]), unConfirmedTx);

    const request = requestMock({
      body: { psbt: batchQueue[0].psbt, feeRate: 10 },
    });
    const response = responseMock();

    await addPSBTController(request as AddPSBTRequest, response as Response);

    expect(response.status).to.have.been.calledWith(400);
    expect(response.json).to.have.been.calledWith({
      error: "BAD_REQUEST",
    });
  });
  it("returns INTERNAL_SERVER_ERROR if psbt could not be added to queue", async () => {
    Sinon.stub(addPSBTToQueue, "addPSBTToQueue").resolves(
      new TransactionResult(false, undefined, "error"),
    );
    const psbt = Psbt.fromBase64(batchQueue[0].psbt, {
      network: networks.regtest,
    });
    mockGetTx(getTxIdOfInput(psbt.txInputs[0]), confirmedTx);
    const request = requestMock({
      body: { psbt: batchQueue[0].psbt, feeRate: 10 },
    });
    const response = responseMock();

    await addPSBTController(request as AddPSBTRequest, response as Response);

    expect(response.status).to.have.been.calledWith(500);
    expect(response.json).to.have.been.calledWith({
      error: "INTERNAL_SERVER_ERROR",
    });
  });
});
