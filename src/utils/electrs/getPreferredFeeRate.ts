import { MEMPOOL_URL } from "../../../constants";
import fetch from "../../../middleware/fetch";
import getLogger from "../logger";

const logger = getLogger("fetch", "getPreferredFeeRate");
export const getPreferredFeeRate = () =>
  fetch(`${MEMPOOL_URL}/v1/fees/recommended`)
    .then(async (response) => {
      const { hourFee } = await response.json();
      return hourFee as number;
    })
    .catch((err) => {
      logger.error(["Could not get fee estimates", err]);
      return null;
    });
