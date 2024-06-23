import { Psbt } from "bitcoinjs-lib";
import { attemptPushToBucket } from "../../src/utils/batch/attemptPushToBucket";

export async function fillUpBucket(
  sortedQueue: { psbt: Psbt }[],
  preferredFeeRate: number,
  bucket: Psbt[] = [],
): Promise<Psbt[]> {
  const remainingQueue = [];
  for (const { psbt } of sortedQueue) {
    // eslint-disable-next-line no-await-in-loop -- we need to wait for the result of the function
    const { wasAdded } = await attemptPushToBucket(
      psbt,
      bucket,
      preferredFeeRate,
    );
    if (!wasAdded) remainingQueue.push({ psbt });
  }
  const transactionsWereAdded = sortedQueue.length !== remainingQueue.length;
  if (transactionsWereAdded && remainingQueue.length > 0) {
    return fillUpBucket(remainingQueue, preferredFeeRate, bucket);
  }
  return bucket;
}
