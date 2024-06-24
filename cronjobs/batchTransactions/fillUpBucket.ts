import { Psbt } from "bitcoinjs-lib";
import { attemptPushToBucket } from "../../src/utils/batch/attemptPushToBucket";

export async function fillUpBucket(
  sortedQueue: { psbt: Psbt }[],
  preferredFeeRate: number,
  bucket: Psbt[] = [],
): Promise<Psbt[]> {
  let index = 0;
  let psbtWasAdded = false;
  for (const { psbt } of sortedQueue) {
    // eslint-disable-next-line no-await-in-loop -- we need to wait for the result of the function
    const { wasAdded } = await attemptPushToBucket(
      psbt,
      bucket,
      preferredFeeRate,
    );
    if (wasAdded) {
      psbtWasAdded = true;
      break;
    }
    index++;
  }
  if (psbtWasAdded) {
    return fillUpBucket(
      sortedQueue.slice(0, index).concat(sortedQueue.slice(index + 1)),
      preferredFeeRate,
      bucket,
    );
  }
  return bucket;
}
