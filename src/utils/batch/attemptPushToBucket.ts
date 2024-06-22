import { Psbt } from "bitcoinjs-lib";
import { finalizeBatch } from "../../../cronjobs/batchTransactions/finalizeBatch";
import { getServiceFees } from "../../../cronjobs/batchTransactions/getServiceFees";

export async function attemptPushToBucket(
  psbt: Psbt,
  bucket: Psbt[],
  feeRateThreshold: number,
) {
  const bucketWithPSBT = [...bucket, psbt];
  const serviceFees = getServiceFees(bucketWithPSBT);

  const { stagedTx } = await finalizeBatch(bucketWithPSBT, serviceFees);
  const finalFeeRate = stagedTx.getFeeRate();
  if (finalFeeRate >= feeRateThreshold) {
    bucket.push(psbt);
    return { wasAdded: true, finalFeeRate };
  }
  return { wasAdded: false, finalFeeRate };
}
