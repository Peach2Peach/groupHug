import { expect } from "chai";
import { getSteps } from "./getSteps";

describe("getSteps", () => {
  it("should divide a value into a given amount of steps", () => {
    expect(getSteps(100, 10)).to.deep.equal([
      12, 23, 34, 45, 56, 67, 78, 89, 100,
    ]);
    expect(getSteps(63, 10)).to.deep.equal([7, 14, 21, 28, 35, 42, 49, 56, 63]);
  });
});
