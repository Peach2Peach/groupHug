import { Psbt } from "bitcoinjs-lib";
import { BATCH_SIZE_THRESHOLD } from "../../constants";
import { db } from "../../src/utils/db";
import { KEYS } from "../../src/utils/db/keys";
import { postTx } from "../../src/utils/electrs";
import { getFeeEstimates } from "../../src/utils/electrs/getFeeEstimates";
import getLogger from "../../src/utils/logger";
import { getPSBTsFromQueue } from "../../src/utils/queue/getPSBTsFromQueue";
import { resetBucketExpiration } from "../../src/utils/queue/resetBucketExpiration";
import { saveBucketStatus } from "../../src/utils/queue/saveBucketStatus";
import { batchBucket } from "./batchBucket";
import { markBatchedTransactionAsPending } from "./helpers/markBatchedTransactionAsPending";

export const logger = getLogger("job", "batchTransactions");

export const batchTransactions = async () => {
  const feeEstimatesResult = await getFeeEstimates();

  if (feeEstimatesResult.error) {
    logger.error(["Could not get fee estimates", feeEstimatesResult.error]);
    return false;
  }

  const bucket = await getPSBTsFromQueue();
  saveBucketStatus({
    participants: bucket.length,
    maxParticipants: BATCH_SIZE_THRESHOLD,
  });

  const timeThresholdReached = !(await db.exists(KEYS.BUCKET.EXPIRATION));

  const result = await (async () => {
    if (!timeThresholdReached && bucket.length < BATCH_SIZE_THRESHOLD) {
      logger.info(["Bucket not ready to be batched"]);
      return true;
    }
    logger.info(["Batching bucket with size:", bucket.length]);
    const batchBucketResult = await batchBucket(
      bucket,
      feeEstimatesResult.result.halfHourFee
    );

    if (!batchBucketResult.isOk()) {
      logger.error([
        "Could not batch transaction",
        batchBucketResult.getError(),
      ]);
      logBatchError(bucket);
      return false;
    }
    const batchedTransaction = batchBucketResult.getValue();
    const postTxResult = await postTx(batchedTransaction.toHex());

    if (postTxResult.isOk()) {
      logger.info(["Transaction succesfully batched"]);

      await db.incr(KEYS.FEE.INDEX);
      const txId = postTxResult.getValue();
      const markResult = await markBatchedTransactionAsPending(bucket, txId);
      saveBucketStatus({
        participants: 0,
        maxParticipants: BATCH_SIZE_THRESHOLD,
      });

      return markResult.isOk();
    }

    logger.error([
      "Could not broadcast batched transaction",
      JSON.stringify(postTxResult.getError()),
      batchedTransaction.toHex(),
    ]);
    logBatchError(bucket);
    return false;
  })();

  if (timeThresholdReached) await resetBucketExpiration();

  return result;
};

function logBatchError(candidate: Psbt[]) {
  logger.error([JSON.stringify(candidate.map((psbt) => psbt.toBase64()))]);
}
