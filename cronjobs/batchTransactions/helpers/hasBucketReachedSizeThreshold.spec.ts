import { expect } from "chai";
import { hasBucketReachedSizeThreshold } from "./hasBucketReachedSizeThreshold";
import * as constants from "../../../constants";
import Sinon from "sinon";
import { psbt1, psbt2, psbt3 } from "../../../test/data/psbtData";
describe("hasBucketReachedSizeThreshold", () => {
  before(() => {
    Sinon.stub(constants, "BATCH_SIZE_THRESHOLD").get(() => 2);
  });
  after(() => {
    Sinon.restore();
  });
  it("returns true if the size of the bucket is equal or bigger than the threshold", () => {
    expect(hasBucketReachedSizeThreshold([psbt1, psbt2])).to.be.true;
    expect(hasBucketReachedSizeThreshold([psbt1, psbt2, psbt3])).to.be.true;
  });
  it("returns false if the size of the bucket less than thethreshold", () => {
    expect(hasBucketReachedSizeThreshold([psbt1])).to.be.false;
    expect(hasBucketReachedSizeThreshold([])).to.be.false;
  });
});
