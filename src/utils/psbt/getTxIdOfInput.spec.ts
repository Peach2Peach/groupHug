import { expect } from "chai";
import { psbt1 } from "../../../test/data/psbtData";
import { getTxIdOfInput } from "./getTxIdOfInput";

describe("getTxIdOfInput", () => {
  it("returns tx id of an input ", () => {
    expect(getTxIdOfInput(psbt1.txInputs[0])).to.equal(
      "21a0fa69fcbcbfc2e03dafff7328ddf86ac38ce881eb5a2b6740b5e10bdcb7b5",
    );
  });
});
