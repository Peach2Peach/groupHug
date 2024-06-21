import { BLOCKEXPLORERURL, MEMPOOL_URL } from "../../../constants";
import fetch from "../../../middleware/fetch";
import getLogger from "../logger";
import { round } from "../math/round";

const getFeeRecommendation = (targets: ConfirmationTargets) => ({
  fastestFee: round(targets["1"], 1),
  halfHourFee: round(targets["3"], 1),
  hourFee: round(targets["6"], 1),
  economyFee: round(targets["144"], 1),
  minimumFee: round(targets["1008"], 1),
});

const getEsploraFeeEstimates = (): Promise<
  | { result: FeeRecommendation; error?: never }
  | (APIError<"INTERNAL_SERVER_ERROR"> & { result?: never })
> =>
  new Promise((resolve) => {
    fetch(`${BLOCKEXPLORERURL}/fee-estimates`)
      .then(async (response) =>
        resolve({ result: getFeeRecommendation(await response.json()) }),
      )
      .catch((err) =>
        resolve({ error: "INTERNAL_SERVER_ERROR", message: err }),
      );
  });

const getMempoolFeeEstimates = (): Promise<
  | { result: FeeRecommendation; error?: never }
  | (APIError<"INTERNAL_SERVER_ERROR"> & { result?: never })
> =>
  new Promise((resolve) => {
    fetch(`${MEMPOOL_URL}/v1/fees/recommended`)
      .then(async (response) => resolve({ result: await response.json() }))
      .catch((err) =>
        resolve({ error: "INTERNAL_SERVER_ERROR", message: err }),
      );
  });

const logger = getLogger("fetch", "getPreferredFeeRate");
export const getPreferredFeeRate = async () => {
  const mempoolEstimates = await getMempoolFeeEstimates();
  const feeEstimates = mempoolEstimates.result
    ? mempoolEstimates
    : await getEsploraFeeEstimates();

  if (feeEstimates.error) {
    logger.error(["Could not get fee estimates", feeEstimates.error]);
    return null;
  }

  return feeEstimates.result.halfHourFee;
};
