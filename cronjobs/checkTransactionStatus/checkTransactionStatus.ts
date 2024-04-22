import {
  addConfirmedTransaction,
  getPendingTransactions,
} from "../../src/utils/batch";
import { getTipHeight } from "../../src/utils/electrs";
import { getConfirmations } from "./getConfirmations";
import { logger } from "./logger";

const MINIMUM_CONFIRMATIONS = 6;
export const checkTransactionStatus = async () => {
  const { result: blockHeight, error } = await getTipHeight();

  if (error) {
    logger.error(["Couldn't determine block height, skipping..."]);
    return false;
  }

  const pending = await getPendingTransactions();

  if (pending.length === 0) {
    logger.info(["No transactions to check, skipping..."]);
    return true;
  }

  logger.info([
    `Checking pending ${pending.length} transactions at block height ${blockHeight}`,
  ]);

  const txWithConfirmationInfo = await Promise.all(
    pending.map(getConfirmations(blockHeight!)),
  );
  const confirmed = txWithConfirmationInfo.filter(
    ({ confirmations }) => confirmations >= MINIMUM_CONFIRMATIONS,
  );
  await Promise.all(confirmed.map(({ txId }) => addConfirmedTransaction(txId)));
  return true;
};
