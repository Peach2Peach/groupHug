import { BLOCKEXPLORERURL } from "../../../constants";
import fetch from "../../../middleware/fetch";
import { round } from "../math/round";

const getFeeRecommendation = (
  targets: ConfirmationTargets
): FeeRecommendation => ({
  fastestFee: round(targets["1"], 1),
  halfHourFee: round(targets["3"], 1),
  hourFee: round(targets["6"], 1),
  economyFee: round(targets["144"], 1),
  minimumFee: round(targets["1008"], 1),
});

export const getFeeEstimates = (): Promise<
  | { result: FeeRecommendation; error?: never }
  | (APIError<"INTERNAL_SERVER_ERROR"> & { result?: never })
> =>
  new Promise((resolve) => {
    fetch(`${BLOCKEXPLORERURL}/fee-estimates`)
      .then(async (response) =>
        resolve({ result: getFeeRecommendation(await response.json()) })
      )
      .catch((err) =>
        resolve({ error: "INTERNAL_SERVER_ERROR", message: err })
      );
  });
