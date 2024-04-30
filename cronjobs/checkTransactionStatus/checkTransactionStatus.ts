import { addConfirmedTransaction } from "../../src/utils/batch/addConfirmedTransaction";
import { db } from "../../src/utils/db";
import { KEYS } from "../../src/utils/db/keys";
import { getTipHeight } from "../../src/utils/electrs/getTipHeight";
import { getConfirmations } from "./getConfirmations";
import { logger } from "./logger";

const MINIMUM_CONFIRMATIONS = 6;
export const checkTransactionStatus = async () => {
  const { result: blockHeight, error } = await getTipHeight();

  if (error) {
    logger.error(["Couldn't determine block height, skipping..."]);
    return false;
  }

  const pendingTxs = await db.smembers(KEYS.TRANSACTION.PENDING);

  if (pendingTxs.length === 0) {
    logger.info(["No transactions to check, skipping..."]);
    return true;
  }

  logger.info([
    `Checking pending ${pendingTxs.length} transactions at block height ${blockHeight}`,
  ]);

  const txWithConfirmationInfo = await Promise.all(
    pendingTxs.map(getConfirmations(blockHeight))
  );
  const confirmed = txWithConfirmationInfo.filter(
    ({ confirmations }) => confirmations >= MINIMUM_CONFIRMATIONS
  );
  await Promise.all(confirmed.map(({ txId }) => addConfirmedTransaction(txId)));
  return true;
};
