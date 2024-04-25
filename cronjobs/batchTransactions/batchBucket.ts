import { Network, Psbt, PsbtTxInput } from "bitcoinjs-lib";
import { NETWORK } from "../../constants";
import { db } from "../../src/utils/db";
import { getTx } from "../../src/utils/electrs/getTx";
import { getUTXO } from "../../src/utils/electrs/getUTXO";
import { ceil, round, sum } from "../../src/utils/math";
import { finalize, getTxIdOfInput } from "../../src/utils/psbt";
import {
  getExtraPSBTData,
  removePSBTFromQueueWithClient,
} from "../../src/utils/queue";
import { PSBTInfo } from "../../src/utils/queue/getExtraPSBTDataById";
import { PSBTWithFeeRate } from "../../src/utils/queue/getPSBTsFromQueue";
import { getError, getResult } from "../../src/utils/result";
import { isDefined } from "../../src/utils/validation";
import { getUnusedFeeAddress } from "../../src/wallets/getUnusedFeeAddress";
import { logger } from "./batchTransactions";
import { inputIsUnspent } from "./helpers/inputIsUnspent";
import { signBatchedTransaction } from "./helpers/signBatchedTransaction";
import { sumPSBTInputValues } from "./helpers/sumPSBTInputValues";
import { sumPSBTOutputValues } from "./helpers/sumPSBTOutputValues";

const SIGNATURE_SIZE_DIFF = 2;
export const batchBucket = async (bucket: PSBTWithFeeRate[]) => {
  const allPsbts = bucket.map(({ psbt }) => psbt);
  const allTxInputs = allPsbts.map((psbt) => psbt.txInputs[0]);
  const utxos = (await Promise.all(allTxInputs.map(getUTXOForInput))).filter(
    isDefined
  );
  const unspent = utxos.map((utxo, i) => inputIsUnspent(allTxInputs[i], utxo));

  const toDelete = allPsbts.filter((_psbt, i) => !unspent[i]);

  await db.transaction(async (client) => {
    await Promise.all(
      toDelete.map((psbt) => removePSBTFromQueueWithClient(client, psbt))
    );
  });

  const psbts = allPsbts.filter((_psbt, i) => unspent[i]);

  if (psbts.length === 0) return getError("No psbts left to spend");

  const averageFeeRate = ceil(
    bucket.map(({ feeRate }) => feeRate).reduce(sum, 0) / bucket.length,
    2
  );
  const extraPSBTData = await Promise.all(psbts.map(getExtraPSBTData));
  const stagedTx = await buildBatchedTransaction(
    psbts,
    averageFeeRate,
    extraPSBTData,
    0
  );
  const miningFees = ceil(
    (stagedTx.virtualSize() + SIGNATURE_SIZE_DIFF) * averageFeeRate
  );
  const finalTransaction = await buildBatchedTransaction(
    psbts,
    averageFeeRate,
    extraPSBTData,
    miningFees
  );
  return getResult(finalTransaction);
};

const FEE_RATE_BUFFER = 4;
const DUST_LIMIT = 546;
async function buildBatchedTransaction(
  psbts: Psbt[],
  averageFeeRate: number,
  extraPSBTData: (PSBTInfo | null)[],
  miningFees: number
) {
  const batchedTransaction = getBatchedTransaction(psbts, NETWORK);
  const serviceFees = calculateServiceFees(psbts);
  batchedTransaction.setMaximumFeeRate(round(averageFeeRate + FEE_RATE_BUFFER));
  logger.info(["averageFeeRate", averageFeeRate]);
  logger.info(["serviceFees", serviceFees]);
  logger.info(["miningFees", miningFees]);

  const finalServiceFee = serviceFees - miningFees;
  if (finalServiceFee > DUST_LIMIT) {
    batchedTransaction.addOutput({
      address: (await getUnusedFeeAddress())!,
      value: finalServiceFee,
    });
  }
  signBatchedTransaction(batchedTransaction, extraPSBTData);
  const finalTransaction = finalize(batchedTransaction);
  return finalTransaction;
}

function calculateServiceFees(psbts: Psbt[]) {
  const inputValues = psbts.map(sumPSBTInputValues).reduce(sum, 0);
  const outputValues = psbts.map(sumPSBTOutputValues).reduce(sum, 0);
  return inputValues - outputValues;
}

function getBatchedTransaction(psbts: Psbt[], network: Network) {
  const batchedTransaction = new Psbt({ network });
  batchedTransaction.addInputs(
    psbts.map((psbt) => ({ ...psbt.txInputs[0], ...psbt.data.inputs[0] }))
  );
  batchedTransaction.addOutputs(psbts.map((psbt) => psbt.txOutputs[0]));

  return batchedTransaction;
}

async function getUTXOForInput(input: PsbtTxInput) {
  const { result: tx } = await getTx(getTxIdOfInput(input));

  if (!tx) return undefined;

  const output = tx.vout[input.index];
  if (!output.scriptpubkey_address) return undefined;
  const { result: utxo } = await getUTXO(output.scriptpubkey_address);

  return utxo?.filter((utx) => utx.txid === getTxIdOfInput(input));
}
