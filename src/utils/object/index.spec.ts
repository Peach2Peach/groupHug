import { expect } from "chai";
import { isDefined } from "../validation";
import * as objectUtils from "./index";

describe("objectUtils", () => {
  it("all exports are defined", () => {
    expect(Object.values(objectUtils).every(isDefined)).to.equal(true);
  });
});
