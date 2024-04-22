import { expect } from "chai";
import { isDefined } from "../validation";
import * as electrsUtils from "./index";

describe("electrsUtils", () => {
  it("all exports are defined", () => {
    expect(Object.values(electrsUtils).every(isDefined)).to.equal(true);
  });
});
