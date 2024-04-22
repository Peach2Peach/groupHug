import { expect } from "chai";
import { isDefined } from "../validation";
import * as psbtUtils from "./index";

describe("psbtUtils", () => {
  it("all exports are defined", () => {
    expect(Object.values(psbtUtils).every(isDefined)).to.equal(true);
  });
});
