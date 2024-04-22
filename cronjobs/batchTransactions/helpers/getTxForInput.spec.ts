import { expect } from "chai";
import { describe, it } from "mocha";
import Sinon from "sinon";
import { BLOCKEXPLORERURL } from "../../../constants";
import blockExplorerData from "../../../test/data/blockExplorerData.json";
import { psbt1 } from "../../../test/data/psbtData";
import { mockGetTx } from "../../../test/unit/helpers/mockGetTx";
import { fetchStub } from "../../../test/unit/hooks";
import { getTxForInput } from "./getTxForInput";
import { getTxIdOfInput } from "../../../src/utils/psbt";

describe("getTxForInput", () => {
  const txId = getTxIdOfInput(psbt1.txInputs[0]);

  afterEach(() => {
    Sinon.restore();
  });
  it("fetches tx details", async () => {
    mockGetTx(txId, blockExplorerData.tx);
    const result = await getTxForInput(psbt1.txInputs[0]);
    expect(result).to.deep.equal(blockExplorerData.tx);
  });
  it("returns undefined if tx could not be retrueved", async () => {
    const error = new Error("error");
    fetchStub.withArgs(`${BLOCKEXPLORERURL}/tx/${txId}`).rejects(error);
    const result = await getTxForInput(psbt1.txInputs[0]);
    expect(result).to.be.undefined;
  });
});
