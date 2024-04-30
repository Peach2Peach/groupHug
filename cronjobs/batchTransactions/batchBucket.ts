import { payments, Psbt, PsbtTxInput } from "bitcoinjs-lib";
import { NETWORK } from "../../constants";
import { sha256 } from "../../src/utils/crypto";
import { db } from "../../src/utils/db";
import { KEYS } from "../../src/utils/db/keys";
import { getTx } from "../../src/utils/electrs/getTx";
import { getUTXO } from "../../src/utils/electrs/getUTXO";
import { ceil, round, sum } from "../../src/utils/math";
import { finalize, getTxIdOfInput } from "../../src/utils/psbt";
import { getError, getResult } from "../../src/utils/result";
import { isDefined } from "../../src/utils/validation";
import { feeWallet } from "../../src/wallets/feeWallet";
import { logger } from "./batchTransactions";
import { inputIsUnspent } from "./helpers/inputIsUnspent";
import { signBatchedTransaction } from "./helpers/signBatchedTransaction";
import { sumPSBTInputValues } from "./helpers/sumPSBTInputValues";
import { sumPSBTOutputValues } from "./helpers/sumPSBTOutputValues";

const SIGNATURE_SIZE_DIFF = 2;
export const batchBucket = async (base64PSBTs: string[], feeRate: number) => {
  const bucket = base64PSBTs.map((base64) =>
    Psbt.fromBase64(base64, { network: NETWORK })
  );
  const allTxInputs = bucket.map((psbt) => psbt.txInputs[0]);
  const utxos = (await Promise.all(allTxInputs.map(getUTXOForInput))).filter(
    isDefined
  );
  const unspent = utxos.map((utxo, i) => inputIsUnspent(allTxInputs[i], utxo));

  const toDelete = bucket.filter((_psbt, i) => !unspent[i]);

  await db.transaction(async (client) => {
    await Promise.all(
      toDelete.map((psbt) => client.srem(KEYS.PSBT.QUEUE, psbt.toBase64()))
    );
  });

  const psbts = bucket.filter((_psbt, i) => unspent[i]);

  if (psbts.length === 0) return getError("No psbts left to spend");

  const stagedTx = await buildBatchedTransaction(psbts, feeRate, 0);
  const miningFees = ceil(
    (stagedTx.virtualSize() + SIGNATURE_SIZE_DIFF) * feeRate
  );
  const finalTransaction = await buildBatchedTransaction(
    psbts,
    feeRate,
    miningFees
  );
  return getResult(finalTransaction);
};

const FEE_RATE_BUFFER = 4;
const DUST_LIMIT = 546;
async function buildBatchedTransaction(
  psbts: Psbt[],
  feeRate: number,
  miningFees: number
) {
  const batchedTransaction = new Psbt({ network: NETWORK });
  batchedTransaction.addInputs(
    psbts.map((psbt) => ({ ...psbt.txInputs[0], ...psbt.data.inputs[0] }))
  );
  batchedTransaction.addOutputs(psbts.map((psbt) => psbt.txOutputs[0]));
  batchedTransaction.setMaximumFeeRate(round(feeRate + FEE_RATE_BUFFER));

  const serviceFees = calculateServiceFees(psbts);
  logger.info(["feeRate", feeRate]);
  logger.info(["serviceFees", serviceFees]);
  logger.info(["miningFees", miningFees]);

  const finalServiceFee = serviceFees - miningFees;
  if (finalServiceFee > DUST_LIMIT) {
    batchedTransaction.addOutput({
      address: (await getUnusedFeeAddress())!,
      value: finalServiceFee,
    });
  }
  const indexes = await Promise.all(
    psbts.map((psbt) =>
      db.client.hGet(KEYS.PSBT.PREFIX + sha256(psbt.toBase64()), "index")
    )
  );
  signBatchedTransaction(batchedTransaction, indexes);
  const finalTransaction = finalize(batchedTransaction);
  return finalTransaction;
}

function calculateServiceFees(psbts: Psbt[]) {
  const inputValues = psbts.map(sumPSBTInputValues).reduce(sum, 0);
  const outputValues = psbts.map(sumPSBTOutputValues).reduce(sum, 0);
  return inputValues - outputValues;
}

async function getUTXOForInput(input: PsbtTxInput) {
  const { result: tx } = await getTx(getTxIdOfInput(input));

  if (!tx) return undefined;

  const output = tx.vout[input.index];
  if (!output.scriptpubkey_address) return undefined;
  const { result: utxo } = await getUTXO(output.scriptpubkey_address);

  return utxo?.filter((utx) => utx.txid === getTxIdOfInput(input));
}

async function getUnusedFeeAddress() {
  const index = Number((await db.get(KEYS.FEE.INDEX)) || 0);
  const feeCollector = feeWallet.derivePath(`0/${index}`);

  return payments.p2wpkh({
    pubkey: feeCollector.publicKey,
    network: NETWORK,
  }).address;
}
