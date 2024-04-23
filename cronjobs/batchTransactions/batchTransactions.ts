import { BATCH_SIZE_THRESHOLD } from "../../constants";
import { getFeeEstimates, postTx } from "../../src/utils/electrs";
import getLogger from "../../src/utils/logger";
import {
  getPSBTsFromQueue,
  resetBucketExpiration,
} from "../../src/utils/queue";
import { PSBTWithFeeRate } from "../../src/utils/queue/getPSBTsFromQueue";
import { saveBucketStatus } from "../../src/utils/queue/saveBucketStatus";
import { batchBucket } from "./batchBucket";
import {
  errorFormatBatch,
  hasBucketReachedTimeThreshold,
  markBatchedTransactionAsPending,
} from "./helpers";

export const logger = getLogger("job", "batchTransactions");

export const batchTransactions = async () => {
  const feeEstimatesResult = await getFeeEstimates();

  if (feeEstimatesResult.isError()) {
    logger.error([
      "Could not get fee estimates",
      feeEstimatesResult.getError(),
    ]);
    return false;
  }

  const bucket = await getPSBTsFromQueue();
  saveBucketStatus({
    participants: bucket.length,
    maxParticipants: BATCH_SIZE_THRESHOLD,
  });

  const timeThresholdReached = await hasBucketReachedTimeThreshold();

  const result = await (() => {
    if (!timeThresholdReached && bucket.length < BATCH_SIZE_THRESHOLD) {
      logger.info(["Bucket not ready to be batched"]);
      return true;
    }
    logger.info(["Batching bucket"]);
    return handleBatch(bucket);
  })();

  if (timeThresholdReached) await resetBucketExpiration();

  return result;
};

async function handleBatch(candidate: PSBTWithFeeRate[]) {
  logger.debug(["Batching bucket; candidates:", candidate.length]);

  const batchBucketResult = await batchBucket(candidate);

  if (!batchBucketResult.isOk()) {
    logger.error(["Could not batch transaction", batchBucketResult.getError()]);
    logger.error([JSON.stringify(errorFormatBatch(candidate))]);
    return false;
  }
  const batchedTransaction = batchBucketResult.getValue();
  const result = await postTx(batchedTransaction.toHex());

  if (result.isOk()) {
    logger.info(["Transaction succesfully batched"]);

    const txId = result.getValue();
    const markResult = await markBatchedTransactionAsPending(candidate, txId);
    saveBucketStatus({
      participants: 0,
      maxParticipants: BATCH_SIZE_THRESHOLD,
    });

    return markResult.isOk();
  }

  logger.error([
    "Could not broadcast batched transaction",
    JSON.stringify(result.getError()),
    batchedTransaction.toHex(),
  ]);
  logger.error([JSON.stringify(errorFormatBatch(candidate))]);
  return false;
}
