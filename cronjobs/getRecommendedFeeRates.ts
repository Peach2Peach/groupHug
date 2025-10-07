import { MEMPOOL_URL } from "../constants";
import { db } from "../src/utils/db";
import { KEYS } from "../src/utils/db/keys";
import getLogger from "../src/utils/logger";

const logger = getLogger("fetch", "getPreferredFeeRate");

export const getRecommendedFeeRatesCronjob = async () => {
  try {
    const response = await fetch(`${MEMPOOL_URL}/v1/fees/recommended`);

    if (!response.ok) {
      throw new Error(`Fetch failed with status ${response.status}`);
    }

    const { hourFee } = await response.json();
    await db.client.set(KEYS.FEE.RECOMMENDED_HOUR, hourFee);

    return true;
  } catch (err) {
    logger.error(["Could not get fee estimates", err]);
    return false;
  }
};
