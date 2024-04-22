import { expect } from "chai";
import { describe, it } from "mocha";
import Sinon from "sinon";
import { BLOCKEXPLORERURL } from "../../../constants";
import blockExplorerData from "../../../test/data/blockExplorerData.json";
import { mockGetTx } from "../../../test/unit/helpers/mockGetTx";
import { fetchStub } from "../../../test/unit/hooks";
import { getTx } from "./getTx";

describe("getTx", () => {
  const txId =
    "9de5b5e6b681dab2def654d8f70ead5cc2f31df36f715d9fd4164e12fb65e22f";

  afterEach(() => {
    Sinon.restore();
  });
  it("fetches tx details", async () => {
    mockGetTx(txId, blockExplorerData.tx);
    const result = await getTx(txId);
    expect(result.getValue()).to.deep.equal(blockExplorerData.tx);
  });
  it("handles response errors", async () => {
    mockGetTx(txId, "Transaction not found", 404);
    const result = await getTx(txId);
    expect(result.getError()).to.deep.equal({ error: "INTERNAL_SERVER_ERROR" });
  });
  it("handles unexpected errors", async () => {
    const error = new Error("error");
    fetchStub.withArgs(`${BLOCKEXPLORERURL}/tx/${txId}`).rejects(error);
    const result = await getTx(txId);
    expect(result.getError()).to.deep.equal({
      error: "INTERNAL_SERVER_ERROR",
      message: error,
    });
  });
});
