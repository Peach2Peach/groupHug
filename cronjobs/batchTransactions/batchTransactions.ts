import {
  BATCH_EXPIRATION_TIME,
  BATCH_TIME_THRESHOLD,
  MSINS,
} from "../../constants";
import { addPSBTToBatchWithClient } from "../../src/utils/batch/addPSBTToBatchWithClient";
import { db } from "../../src/utils/db";
import { KEYS } from "../../src/utils/db/keys";
import { postTx } from "../../src/utils/electrs";
import { getFeeEstimates } from "../../src/utils/electrs/getFeeEstimates";
import getLogger from "../../src/utils/logger";
import { batchBucket } from "./batchBucket";

export const logger = getLogger("job", "batchTransactions");

export const batchTransactions = async () => {
  const feeEstimatesResult = await getFeeEstimates();

  if (feeEstimatesResult.error) {
    logger.error(["Could not get fee estimates", feeEstimatesResult.error]);
    return false;
  }

  const queuedBase64PSBTs = await db.smembers(KEYS.PSBT.QUEUE);
  const bucketIsExpired = !(await db.exists(KEYS.BUCKET.EXPIRATION));
  const timeThresholdReached = !(await db.exists(KEYS.BUCKET.TIME_THRESHOLD));

  const result = await (async () => {
    if (
      (!timeThresholdReached && !bucketIsExpired) ||
      queuedBase64PSBTs.length === 0
    ) {
      logger.info(["Bucket not ready to be batched"]);
      return true;
    }
    logger.info([
      "Attempting batch with " + queuedBase64PSBTs.length + " PSBTs in queue",
    ]);
    const batchBucketResult = await batchBucket(
      queuedBase64PSBTs,
      feeEstimatesResult.result.halfHourFee,
      bucketIsExpired,
    );

    if (!batchBucketResult.result) {
      logger.error(["Could not batch transaction - ", batchBucketResult.error]);
      logger.error([JSON.stringify(queuedBase64PSBTs)]);
      return false;
    }
    const { finalTransaction, bucket } = batchBucketResult.result;
    const postTxResult = await postTx(finalTransaction.toHex());

    if (postTxResult.isOk()) {
      logger.info(["Batch transaction succesfully broadcasted"]);

      const txId = postTxResult.getValue();
      const transactionResult = await db.transaction(async (client) => {
        await client.incr(KEYS.FEE.INDEX);
        await client.set(
          KEYS.BUCKET.TIME_THRESHOLD,
          "true",
          BATCH_TIME_THRESHOLD * MSINS,
        );
        await client.set(
          KEYS.BUCKET.EXPIRATION,
          "true",
          BATCH_EXPIRATION_TIME * MSINS,
        );
        const base64Bucket = bucket.map((psbt) => psbt.toBase64());
        await Promise.all(
          base64Bucket.map((psbt) =>
            addPSBTToBatchWithClient(client, txId, psbt),
          ),
        );
        await client.srem(KEYS.PSBT.QUEUE, base64Bucket);
      });

      return transactionResult.ok;
    }

    logger.error([
      "Could not broadcast batched transaction",
      JSON.stringify(postTxResult.getError()),
      finalTransaction.toHex(),
    ]);
    logger.error([JSON.stringify(queuedBase64PSBTs)]);
    return false;
  })();

  if (queuedBase64PSBTs.length === 0) {
    await db.transaction(async (client) => {
      await client.set(
        KEYS.BUCKET.TIME_THRESHOLD,
        "true",
        BATCH_TIME_THRESHOLD * MSINS,
      );
      await client.set(
        KEYS.BUCKET.EXPIRATION,
        "true",
        BATCH_EXPIRATION_TIME * MSINS,
      );
    });
  }

  return result;
};
