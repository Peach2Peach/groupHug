import { networks } from "bitcoinjs-lib";
import { BLOCKEXPLORERURL, NETWORK } from "../../../constants";
import fetch from "../../../middleware/fetch";
import getLogger from "../logger";
import { db } from "../db";
import { KEYS } from "../db/keys";

const logger = getLogger("fetch", "getPreferredFeeRate");
export const getPreferredFeeRate = async () => {
  if (NETWORK === networks.regtest) {
    return fetch(`${BLOCKEXPLORERURL}/fee-estimates`)
      .then(async (response) => {
        const electrsRes = await response.json();
        return electrsRes["6"];
      })
      .catch((err) => {
        logger.error(["Could not get fee estimates", err]);
        return null;
      });
  }
  const result = await db.client.get(KEYS.FEE.RECOMMENDED_HOUR);
  if (result === null) {
    logger.error(["Fee estimate is not ready yet"]);
    return null;
  }
};
