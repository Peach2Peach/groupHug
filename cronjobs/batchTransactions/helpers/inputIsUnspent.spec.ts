import { expect } from "chai";
import { getTxIdOfInput } from "../../../src/utils/psbt";
import blockExplorerData from "../../../test/data/blockExplorerData.json";
import { psbt1 } from "../../../test/data/psbtData";
import { inputIsUnspent } from "./inputIsUnspent";

describe("inputIsUnspent", () => {
  it("returns true if no input has been spent already", () => {
    const utxo = blockExplorerData.utxo.map((u: UTXO) => ({
      ...u,
      txid: getTxIdOfInput(psbt1.txInputs[0]),
    }));
    expect(inputIsUnspent(psbt1.txInputs[0], utxo)).to.be.true;
  });
  it("returns false if any input has been spent already", () => {
    const utxo = blockExplorerData.utxo.map((u: UTXO) => ({
      ...u,
      txid: "othertxid",
    }));
    expect(inputIsUnspent(psbt1.txInputs[0], utxo)).to.be.false;
    expect(inputIsUnspent(psbt1.txInputs[0], [])).to.be.false;
  });
});
