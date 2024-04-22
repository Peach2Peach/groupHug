import { getFeeRanges, getSteps } from ".";
import { BUCKETS } from "../../../constants";
import { getFeeEstimates } from "../electrs";

export const getBucketIndexByFeeRate = async (feeRate: number) => {
  const feeEstimatesResult = await getFeeEstimates();
  if (feeEstimatesResult.isError()) return undefined;

  const { fastestFee } = feeEstimatesResult.getValue();
  const feeRanges = getFeeRanges(getSteps(fastestFee, BUCKETS)).reverse();

  const index = feeRanges.findIndex((feeRange) => feeRate >= feeRange[0]);
  return index;
};
