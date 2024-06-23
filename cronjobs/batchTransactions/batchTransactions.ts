import {
  BATCH_EXPIRATION_TIME,
  BATCH_TIME_THRESHOLD,
  MSINS,
} from "../../constants";
import { addPSBTToBatchWithClient } from "../../src/utils/batch/addPSBTToBatchWithClient";
import { db } from "../../src/utils/db";
import { KEYS } from "../../src/utils/db/keys";
import { SubClient } from "../../src/utils/db/SubClient";
import { getPreferredFeeRate } from "../../src/utils/electrs/getPreferredFeeRate";
import { postTx } from "../../src/utils/electrs/postTx";
import getLogger from "../../src/utils/logger";
import { thousands } from "../../src/utils/string/thousands";
import { batchBucket } from "./batchBucket";

export const logger = getLogger("job", "batchTransactions");

const ESTIMATED_BYTES_PER_REGULAR_TX = 170;
const BASE = 10;
const CENT = 100;

export const batchTransactions = async () => {
  const preferredFeeRate = await getPreferredFeeRate();
  if (!preferredFeeRate) return false;

  const queuedBase64PSBTs = await db.client.sMembers(KEYS.PSBT.QUEUE);
  const bucketIsExpired =
    (await db.client.exists(KEYS.BUCKET.EXPIRATION)) === 0;

  const timeThresholdReached =
    (await db.client.exists(KEYS.BUCKET.TIME_THRESHOLD)) === 0;

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
      preferredFeeRate,
      bucketIsExpired,
    );

    if (!batchBucketResult.result) {
      logger.error([
        "Could not batch transaction - " + batchBucketResult.error,
      ]);
      logger.error([JSON.stringify(queuedBase64PSBTs)]);
      return false;
    }
    const {
      finalTransaction,
      bucket,
      serviceFees,
      finalFeeRate,
      miningFees,
      excessMiningFees,
    } = batchBucketResult.result;
    const postTxResult = await postTx(finalTransaction.toHex());

    if (postTxResult.isOk()) {
      const txId = postTxResult.getValue();

      const transactionResult = await db.transaction(async (client) => {
        await client.incr(KEYS.FEE.INDEX);
        await client.client.incrBy(KEYS.FEE.RESERVE, excessMiningFees);
        await resetExpiration(client);
        const base64Bucket = bucket.map((psbt) => psbt.toBase64());
        await Promise.all(
          base64Bucket.map((psbt) =>
            addPSBTToBatchWithClient(client, txId, psbt),
          ),
        );
        await client.srem(KEYS.PSBT.QUEUE, base64Bucket);
      });

      const assumedMiningFees =
        finalFeeRate * bucket.length * ESTIMATED_BYTES_PER_REGULAR_TX;
      const DIGITS_AFTER_DECIMAL = 3;
      const savingsPercentage =
        (Math.round(
          (1 - miningFees / assumedMiningFees) * BASE ** DIGITS_AFTER_DECIMAL,
        ) /
          BASE ** DIGITS_AFTER_DECIMAL) *
        CENT;

      const successMsg = "Batch transaction successfully broadcasted!";
      const externalLink = `You can view it here: https://mempool.space/tx/${txId}`;
      const transactionsBatched = `Transactions batched: ${bucket.length} / ${queuedBase64PSBTs.length}`;
      const feesCollected = `Service fees collected: ${thousands(serviceFees)}`;
      const miningFeesSaved = `Mining fees saved: ${thousands(assumedMiningFees - miningFees)}`;
      const savingsPercentageMsg = `Savings percentage: ${savingsPercentage}%`;
      const potentialServiceFee =
        excessMiningFees > 0
          ? `Missed out on ${thousands(excessMiningFees)} sats in service fees`
          : `Would have received ${thousands(-excessMiningFees)} less sats in service fees`;

      logger.info([successMsg]);
      logger.info([externalLink]);
      logger.info([transactionsBatched]);
      logger.info([feesCollected]);
      logger.info([miningFeesSaved]);
      logger.info([savingsPercentageMsg]);
      logger.info([potentialServiceFee]);
      // if (NODE_ENV === "production") {
      //   await webhook.send({
      //     text,
      //     icon_emoji: ":rocket:",
      //   });
      // }

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
    await db.transaction((client) => resetExpiration(client));
  }

  return result;
};

async function resetExpiration(client: SubClient) {
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
}
