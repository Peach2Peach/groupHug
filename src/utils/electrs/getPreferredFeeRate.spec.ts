import { expect } from "chai";
import Sinon from "sinon";
import { MEMPOOL_URL } from "../../../constants";
import { feeEstimates, rawFeeEstimates } from "../../../test/data/electrsData";
import { getFetchResponse } from "../../../test/unit/helpers/getFetchResponse";
import { fetchStub } from "../../../test/unit/hooks";
import { round } from "../math/round";
import { getPreferredFeeRate } from "./getPreferredFeeRate";

describe("getPreferredFeeRate", () => {
  afterEach(() => {
    Sinon.restore();
  });

  it("should call fetch with url and return fee recommendation rounded", async () => {
    fetchStub.withArgs(`${MEMPOOL_URL}/v1/fees/recommended`).resolves(
      getFetchResponse({
        fastestFee: round(rawFeeEstimates["1"], 1),
        halfHourFee: round(rawFeeEstimates["3"], 1),
        hourFee: round(rawFeeEstimates["6"], 1),
        economyFee: round(rawFeeEstimates["144"], 1),
        minimumFee: round(rawFeeEstimates["1008"], 1),
      }),
    );

    const result = await getPreferredFeeRate();
    expect(result).to.deep.equal(feeEstimates.hourFee);
  });

  it("should handle errors", async () => {
    const errorMessage = new Error("error message");
    fetchStub
      .withArgs(`${MEMPOOL_URL}/v1/fees/recommended`)
      .rejects(errorMessage);

    const result = await getPreferredFeeRate();
    expect(result).to.deep.equals(null);
  });
});
