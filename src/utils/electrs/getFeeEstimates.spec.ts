import { expect } from "chai";
import Sinon from "sinon";
import { BLOCKEXPLORERURL, MEMPOOL_URL } from "../../../constants";
import { feeEstimates, rawFeeEstimates } from "../../../test/data/electrsData";
import { getFetchResponse } from "../../../test/unit/helpers/getFetchResponse";
import { fetchStub } from "../../../test/unit/hooks";
import { round } from "../math/round";
import { getFeeEstimates } from "./getFeeEstimates";

describe("getFeeEstimates", () => {
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

    const { result } = await getFeeEstimates();
    expect(result).to.deep.equal(feeEstimates);
  });

  it("should fallback to esplora if mempool fails", async () => {
    fetchStub
      .withArgs(`${MEMPOOL_URL}/v1/fees/recommended`)
      .rejects(new Error("error message"));
    fetchStub
      .withArgs(`${BLOCKEXPLORERURL}/fee-estimates`)
      .resolves(getFetchResponse(rawFeeEstimates));

    const { result } = await getFeeEstimates();
    expect(result).to.deep.equal(feeEstimates);
  });

  it("should handle errors", async () => {
    const errorMessage = new Error("error message");
    fetchStub
      .withArgs(`${MEMPOOL_URL}/v1/fees/recommended`)
      .rejects(errorMessage);
    fetchStub
      .withArgs(`${BLOCKEXPLORERURL}/fee-estimates`)
      .rejects(errorMessage);

    const error = await getFeeEstimates();
    expect(error).to.deep.equals({
      error: "INTERNAL_SERVER_ERROR",
      message: errorMessage,
    });
  });
});
