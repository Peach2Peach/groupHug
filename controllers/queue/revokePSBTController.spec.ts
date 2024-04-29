/* eslint-disable prefer-destructuring */
import chai, { expect } from "chai";
import { Response } from "express";
import { describe, it } from "mocha";
import sinonChai from "sinon-chai";
import { db } from "../../src/utils/db";
import { getExtraPSBTDataById } from "../../src/utils/queue";
import { getPSBTsFromQueue } from "../../src/utils/queue/getPSBTsFromQueue";
import { registerPSBTWithClient } from "../../src/utils/queue/registerPSBTWithClient";
import { psbt1, psbtBase64_1 } from "../../test/data/psbtData";
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
    const result = await db.transaction((client) =>
      registerPSBTWithClient(client, psbtBase64_1)
    );
    id = result.getResult()!.id;
    revocationToken = result.getResult()!.revocationToken;
  });
  it("removes PSBT from queue", async () => {
    const request = requestMock({ body: { id, revocationToken } });
    const response = responseMock();
    await revokePSBTController(
      request as RevokePSBTRequest,
      response as Response
    );

    expect(response.json).to.be.calledWith({ success: true });
    expect(await getExtraPSBTDataById(id)).to.be.null;
    expect(await getPSBTsFromQueue()).not.to.include(psbt1.toBase64());
  });
});
