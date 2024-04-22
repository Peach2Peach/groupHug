import { Psbt } from "bitcoinjs-lib";
import { NETWORK } from "../../constants";
import { ceil, round } from "../../src/utils/math";
import { finalize } from "../../src/utils/psbt";
import { getExtraPSBTData } from "../../src/utils/queue";
import { PSBTInfo } from "../../src/utils/queue/getExtraPSBTDataById";
import { PSBTWithFeeRate } from "../../src/utils/queue/getPSBTsFromQueue";
import { getError, getResult } from "../../src/utils/result";
import { getUnusedFeeAddress } from "../../src/wallets";
import { logger } from "./batchTransactions";
import { getAverageFeeRate, getBatchedTransaction } from "./helpers";
import { addFeeOutput } from "./helpers/addFeeOutput";
import { calculateServiceFees } from "./helpers/calculateServiceFees";
import { getUnspentPsbts } from "./helpers/getUnspentPsbts";
import { signBatchedTransaction } from "./helpers/signBatchedTransaction";

const SIGNATURE_SIZE_DIFF = 2;
const FEE_RATE_BUFFER = 4;
const DUST_LIMIT = 546;

const buildBatchedTransaction = async (
  psbts: Psbt[],
  averageFeeRate: number,
  extraPSBTData: PSBTInfo[],
  miningFees: number,
) => {
  const batchedTransaction = getBatchedTransaction(psbts, NETWORK);
  const serviceFees = calculateServiceFees(psbts);
  batchedTransaction.setMaximumFeeRate(round(averageFeeRate + FEE_RATE_BUFFER));
  logger.info(["averageFeeRate", averageFeeRate]);
  logger.info(["serviceFees", serviceFees]);
  logger.info(["miningFees", miningFees]);

  const finalServiceFee = serviceFees - miningFees;
  if (finalServiceFee > DUST_LIMIT)
    addFeeOutput(
      batchedTransaction,
      await getUnusedFeeAddress(),
      finalServiceFee,
    );
  signBatchedTransaction(batchedTransaction, extraPSBTData);
  const finalTransaction = finalize(batchedTransaction);
  return finalTransaction;
};

export const batchBucket = async (bucket: PSBTWithFeeRate[]) => {
  const { psbts } = await getUnspentPsbts(bucket.map(({ psbt }) => psbt));

  if (psbts.length === 0) return getError("No psbts left to spend");

  const averageFeeRate = getAverageFeeRate(bucket);
  const extraPSBTData = await Promise.all(psbts.map(getExtraPSBTData));
  const stagedTx = await buildBatchedTransaction(
    psbts,
    averageFeeRate,
    extraPSBTData,
    0,
  );
  const miningFees = ceil(
    (stagedTx.virtualSize() + SIGNATURE_SIZE_DIFF) * averageFeeRate,
  );
  const finalTransaction = await buildBatchedTransaction(
    psbts,
    averageFeeRate,
    extraPSBTData,
    miningFees,
  );
  return getResult(finalTransaction);
};
