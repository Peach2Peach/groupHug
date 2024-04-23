import { Psbt } from "bitcoinjs-lib";
import { NETWORK } from "../../constants";
import { db } from "../../src/utils/db";
import { ceil, round } from "../../src/utils/math";
import { finalize } from "../../src/utils/psbt";
import {
  getExtraPSBTData,
  removePSBTFromQueueWithClient,
} from "../../src/utils/queue";
import { PSBTInfo } from "../../src/utils/queue/getExtraPSBTDataById";
import { PSBTWithFeeRate } from "../../src/utils/queue/getPSBTsFromQueue";
import { getError, getResult } from "../../src/utils/result";
import { isDefined } from "../../src/utils/validation";
import { getUnusedFeeAddress } from "../../src/wallets";
import { logger } from "./batchTransactions";
import {
  getAverageFeeRate,
  getBatchedTransaction,
  inputIsUnspent,
} from "./helpers";
import { addFeeOutput } from "./helpers/addFeeOutput";
import { calculateServiceFees } from "./helpers/calculateServiceFees";
import { getUTXOForInput } from "./helpers/getUTXOForInput";
import { signBatchedTransaction } from "./helpers/signBatchedTransaction";

const SIGNATURE_SIZE_DIFF = 2;
export const batchBucket = async (bucket: PSBTWithFeeRate[]) => {
  const allPsbts = bucket.map(({ psbt }) => psbt);
  const allTxInputs = allPsbts.map((psbt) => psbt.txInputs[0]);
  const utxos = (await Promise.all(allTxInputs.map(getUTXOForInput))).filter(
    isDefined,
  );
  const unspent = utxos.map((utxo, i) => inputIsUnspent(allTxInputs[i], utxo));

  const toDelete = allPsbts.filter((_psbt, i) => !unspent[i]);

  await db.transaction(async (client) => {
    await Promise.all(
      toDelete.map((psbt) => removePSBTFromQueueWithClient(client, psbt)),
    );
  });

  const psbts = allPsbts.filter((_psbt, i) => unspent[i]);

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

const FEE_RATE_BUFFER = 4;
const DUST_LIMIT = 546;
async function buildBatchedTransaction(
  psbts: Psbt[],
  averageFeeRate: number,
  extraPSBTData: (PSBTInfo | null)[],
  miningFees: number,
) {
  const batchedTransaction = getBatchedTransaction(psbts, NETWORK);
  const serviceFees = calculateServiceFees(psbts);
  batchedTransaction.setMaximumFeeRate(round(averageFeeRate + FEE_RATE_BUFFER));
  logger.info(["averageFeeRate", averageFeeRate]);
  logger.info(["serviceFees", serviceFees]);
  logger.info(["miningFees", miningFees]);

  const finalServiceFee = serviceFees - miningFees;
  if (finalServiceFee > DUST_LIMIT) {
    addFeeOutput(
      batchedTransaction,
      (await getUnusedFeeAddress())!,
      finalServiceFee,
    );
  }
  signBatchedTransaction(batchedTransaction, extraPSBTData);
  const finalTransaction = finalize(batchedTransaction);
  return finalTransaction;
}
