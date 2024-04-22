import { expect } from "chai";
import { isDefined } from "../validation";
import * as bitcoinUtils from "./index";

describe("bitcoinUtils", () => {
  it("all exports are defined", () => {
    expect(Object.values(bitcoinUtils).every(isDefined)).to.equal(true);
  });
});
