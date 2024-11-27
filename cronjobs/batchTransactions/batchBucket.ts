import { Psbt } from "bitcoinjs-lib";
import { NETWORK } from "../../constants";
import { getExcessMiningFees } from "../../src/utils/batch/getExcessMiningFees";
import { sha256 } from "../../src/utils/crypto/sha256";
import { db } from "../../src/utils/db";
import { KEYS } from "../../src/utils/db/keys";
import { mapPSBTToDensity } from "../../src/utils/psbt/mapPSBTToDensity";
import { logger } from "./batchTransactions";
import { fillUpBucket } from "./fillUpBucket";
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
  const utxos = await Promise.all(allTxInputs.map(getUTXOForInput));
  const unspent = utxos.map((utxo, i) => inputIsUnspent(allTxInputs[i], utxo));

  const toDelete = base64PSBTs.filter((_psbt, i) => unspent[i] === false);
  if (toDelete.length > 0) {
    logger.info([`Removing ${toDelete.length} PSBTs from queue`]);
    toDelete.forEach((base64) => {
      logger.info([`Removing PSBT ${sha256(base64)}`]);
    });
    await db.client.sRem(KEYS.PSBT.QUEUE, toDelete);
  }
  const unspentPSBTs = allPSBTs.filter((_psbt, i) => unspent[i] === true);

  if (unspentPSBTs.length === 0) {
    return { error: "No psbts left to spend" };
  }

  const psbtsMappedToDensity = await Promise.all(
    unspentPSBTs.map(mapPSBTToDensity),
  );
  const sortedPsbts = psbtsMappedToDensity.sort(
    (a, b) => b.density - a.density,
  );
  const bucket = await fillUpBucket(sortedPsbts, feeRateThreshold);
  const base64Bucket = bucket.map((psbt) => psbt.toBase64());
  unspentPSBTs.forEach((psbt) => {
    const base64PSBT = psbt.toBase64();
    if (!base64Bucket.includes(base64PSBT)) {
      logger.info([`Skipped PSBT ${sha256(base64PSBT)}`]);
    }
  });
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
    finalTransaction.virtualSize(),
    miningFees,
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
