import { expect } from "chai";
import { getError } from "./getError";

describe("getError", () => {
  it("returns an error object", () => {
    const error = "error";
    const result = getError(error);
    expect(result.isOk()).to.be.false;
    expect(result.getValue()).to.be.undefined;
    expect(result.isError()).to.be.true;
    expect(result.getError()).to.equal(error);
  });
});
