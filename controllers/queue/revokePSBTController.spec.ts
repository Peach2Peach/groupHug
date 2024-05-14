/* eslint-disable prefer-destructuring */
import chai, { expect } from "chai";
import { Response } from "express";
import { describe, it } from "mocha";
import sinonChai from "sinon-chai";
import { db } from "../../src/utils/db";
import { KEYS } from "../../src/utils/db/keys";
import { registerPSBTWithClient } from "../../src/utils/queue/registerPSBTWithClient";
import { psbtBase64_1 } from "../../test/data/psbtData";
import {
  requestMock,
  responseMock,
} from "../../test/unit/controllers/expressMocks";
import { revokePSBTController } from "./revokePSBTController";
import { RevokePSBTRequest } from "./types";

chai.use(sinonChai);

describe("revokePSBTController", () => {
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
  it("removes PSBT from queue", async () => {
    const request = requestMock({ body: { id, revocationToken } });
    const response = responseMock();
    await revokePSBTController(
      request as RevokePSBTRequest,
      response as Response,
    );

    expect(response.json).to.be.calledWith({ success: true });
    expect(await db.client.hGet(KEYS.PSBT.PREFIX + id, "psbt")).to.be.null;
    expect(await db.smembers(KEYS.PSBT.QUEUE)).not.to.include(psbtBase64_1);
  });
  it("returns false if PSBT not found", async () => {
    const request = requestMock({ body: { id: "invalid", revocationToken } });
    const response = responseMock();
    await revokePSBTController(
      request as RevokePSBTRequest,
      response as Response,
    );

    expect(response.json).to.be.calledWith({ success: false });
  });
});
