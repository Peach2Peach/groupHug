import { expect } from "chai";
import { describe, it } from "mocha";
import Sinon from "sinon";
import { BLOCKEXPLORERURL } from "../../../constants";
import { getTxIdOfInput } from "../../../src/utils/psbt";
import blockExplorerData from "../../../test/data/blockExplorerData.json";
import { psbt1 } from "../../../test/data/psbtData";
import { mockGetTx } from "../../../test/unit/helpers/mockGetTx";
import { mockGetUTXO } from "../../../test/unit/helpers/mockGetUTXO";
import { spiceUTXOWithPSBT } from "../../../test/unit/helpers/spiceUTXOWithPSBT";
import { fetchStub } from "../../../test/unit/hooks";
import { getUTXOForInput } from "./getUTXOForInput";

describe("getUTXOForInput", () => {
  const txId = getTxIdOfInput(psbt1.txInputs[0]);
  const spicedUTXO = spiceUTXOWithPSBT(psbt1);
  afterEach(() => {
    Sinon.restore();
  });
  it("fetches utxo details", async () => {
    mockGetTx(txId, blockExplorerData.tx);
    mockGetUTXO(blockExplorerData.tx.vout[0].scriptpubkey_address, spicedUTXO);
    const result = await getUTXOForInput(psbt1.txInputs[0]);
    expect(result).to.deep.equal([spicedUTXO[0]]);
  });
  it("returns undefined if tx could not be retrueved", async () => {
    const error = new Error("error");
    fetchStub.withArgs(`${BLOCKEXPLORERURL}/tx/${txId}`).rejects(error);
    const result = await getUTXOForInput(psbt1.txInputs[0]);
    expect(result).to.be.undefined;
  });
});
