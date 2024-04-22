import { describe, it } from "mocha";
import { TransactionResult } from "./TransactionResult";
import { expect } from "chai";

describe("TransactionResult", () => {
  it("returns ok results", () => {
    const result = new TransactionResult(true);
    expect(result.isOk()).to.be.true;
    expect(result.isError()).to.be.false;
  });
  it("returns result data", () => {
    const data = "any data";
    const result = new TransactionResult(true, data);
    expect(result.getResult()).to.equal(data);
  });
  it("returns error for error results", () => {
    const error = "error";
    const result = new TransactionResult(false, undefined, error);
    expect(result.isError()).to.be.true;
    expect(result.isOk()).to.be.false;
    expect(result.getError()).to.equal(error);
  });
});
