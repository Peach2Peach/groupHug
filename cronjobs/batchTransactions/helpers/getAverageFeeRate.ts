import { ceil, sum } from "../../../src/utils/math";
import { PSBTWithFeeRate } from "../../../src/utils/queue/getPSBTsFromQueue";

export const getAverageFeeRate = (bucket: PSBTWithFeeRate[]) =>
  ceil(bucket.map(({ feeRate }) => feeRate).reduce(sum, 0) / bucket.length, 2);
