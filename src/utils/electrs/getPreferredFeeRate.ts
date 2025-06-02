import { networks } from "bitcoinjs-lib";
import { BLOCKEXPLORERURL, MEMPOOL_URL, NETWORK } from "../../../constants";
import fetch from "../../../middleware/fetch";
import getLogger from "../logger";

const logger = getLogger("fetch", "getPreferredFeeRate");
export const getPreferredFeeRate = () => {
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
  return fetch(`${MEMPOOL_URL}/v1/fees/recommended`)
    .then(async (response) => {
      const { hourFee } = await response.json();
      return hourFee as number;
    })
    .catch((err) => {
      logger.error(["Could not get fee estimates", err]);
      return null;
    });
};
