/* eslint-disable max-statements */
import { strictEqual } from "assert";
import { describe, it } from "mocha";
import { sum } from ".";

describe("sum", () => {
  it("sums two numbers ", () => {
    strictEqual(sum(1.348, 1), 2.348);
    strictEqual(sum(45, -1), 44);
    strictEqual(sum(-4, -1), -5);
    strictEqual(sum(-4, 3), -1);
  });
});
