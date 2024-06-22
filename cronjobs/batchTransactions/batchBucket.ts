import { Psbt } from "bitcoinjs-lib";
import { NETWORK } from "../../constants";
import { attemptPushToBucket } from "../../src/utils/batch/attemptPushToBucket";
import { getExcessMiningFees } from "../../src/utils/batch/getExcessMiningFees";
import { sha256 } from "../../src/utils/crypto/sha256";
import { db } from "../../src/utils/db";
import { KEYS } from "../../src/utils/db/keys";
import { mapPSBTToDensity } from "../../src/utils/psbt/mapPSBTToDensity";
import { isDefined } from "../../src/utils/validation";
import { logger } from "./batchTransactions";
import { finalizeBatch } from "./finalizeBatch";
import { getServiceFees } from "./getServiceFees";
import { getUTXOForInput } from "./getUTXOForInput";
import { inputIsUnspent } from "./helpers/inputIsUnspent";

const BYTES_PER_INPUT = 41;
const MAX_ACCEPTABLE_LOSS = 0.02;
export const batchBucket = async (
  base64PSBTs: string[],
  feeRateThreshold: number,
  overrideMinServiceFees: boolean,
) => {
  const allPSBTs = base64PSBTs.map((base64) =>
    Psbt.fromBase64(base64, { network: NETWORK }),
  );
  const allTxInputs = allPSBTs.map((psbt) => psbt.txInputs[0]);
  const utxos = (await Promise.all(allTxInputs.map(getUTXOForInput))).filter(
    isDefined,
  );
  const unspent = utxos.map((utxo, i) => inputIsUnspent(allTxInputs[i], utxo));

  const toDelete = base64PSBTs.filter((_psbt, i) => !unspent[i]);
  if (toDelete.length > 0) {
    logger.info([
      `Removing ${toDelete.length} PSBTs from queue: ${toDelete.join(", ")}`,
    ]);
    await db.client.sRem(KEYS.PSBT.QUEUE, toDelete);
  }
  const unspentPSBTs = allPSBTs.filter((_psbt, i) => unspent[i]);

  if (unspentPSBTs.length === 0) {
    return { error: "No psbts left to spend" };
  }

  const psbtsMappedToDensity = await Promise.all(
    unspentPSBTs.map(mapPSBTToDensity),
  );
  const sortedPsbts = psbtsMappedToDensity.sort(
    (a, b) => b.density - a.density,
  );
  const bucket: Psbt[] = [];
  for (const { psbt } of sortedPsbts) {
    // eslint-disable-next-line no-await-in-loop -- we need to wait for the result of the function
    const { wasAdded, finalFeeRate } = await attemptPushToBucket(
      psbt,
      bucket,
      feeRateThreshold,
    );
    if (!wasAdded) {
      logger.info([
        `Skipping PSBT ${sha256(psbt.toBase64())} - Fee threshold is ${feeRateThreshold} but final fee rate is ${finalFeeRate}`,
      ]);
    }
  }
  if (bucket.length === 0) {
    return { error: "No PSBTs could be batched" };
  }

  const serviceFees = getServiceFees(bucket);
  const minServiceFees = Math.round(
    feeRateThreshold * BYTES_PER_INPUT * (1 / MAX_ACCEPTABLE_LOSS),
  );
  if (serviceFees < minServiceFees && !overrideMinServiceFees) {
    return {
      error: `Service fees too low - ${serviceFees} < ${minServiceFees}`,
    };
  }

  const { finalTransaction, stagedTx } = await finalizeBatch(
    bucket,
    serviceFees,
  );
  const finalFeeRate = stagedTx.getFeeRate();
  const miningFees = stagedTx.getFee();
  if (finalFeeRate < feeRateThreshold) {
    return { error: "Sanity check failed - Final fee rate too low" };
  }
  const excessMiningFees = getExcessMiningFees(
    feeRateThreshold,
    finalFeeRate,
    finalTransaction.virtualSize(),
  );
  return {
    result: {
      finalTransaction,
      bucket,
      serviceFees,
      finalFeeRate,
      miningFees,
      excessMiningFees,
    },
  };
};
