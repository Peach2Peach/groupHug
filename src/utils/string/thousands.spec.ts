import { expect } from "chai";
import { thousands } from "./thousands";

describe("thousands", () => {
  it("should format large numbers as expected", () => {
    expect(thousands(1000)).to.equal("1 000");
    expect(thousands(1000000)).to.equal("1 000 000");
    expect(thousands(1234.567)).to.equal("1 234.567");
  });
});
