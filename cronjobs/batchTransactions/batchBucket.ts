import { payments, Psbt, PsbtTxInput } from "bitcoinjs-lib";
import { DUST_LIMIT, FEE, NETWORK } from "../../constants";
import { sha256 } from "../../src/utils/crypto/sha256";
import { db } from "../../src/utils/db";
import { KEYS } from "../../src/utils/db/keys";
import { getTx } from "../../src/utils/electrs/getTx";
import { getUTXO } from "../../src/utils/electrs/getUTXO";
import { finalize, getTxIdOfInput, signAllInputs } from "../../src/utils/psbt";
import { isDefined } from "../../src/utils/validation";
import { feeWallet } from "../../src/wallets/feeWallet";
import { getSignerByIndex } from "../../src/wallets/getSignerByIndex";
import { hotWallet, oldHotWallet } from "../../src/wallets/hotWallet";
import { logger } from "./batchTransactions";
import { getServiceFees } from "./getServiceFees";
import { inputIsUnspent } from "./helpers/inputIsUnspent";
import { signBatchedTransaction } from "./helpers/signBatchedTransaction";
import { sumPSBTInputValues } from "./helpers/sumPSBTInputValues";
import { sumPSBTOutputValues } from "./helpers/sumPSBTOutputValues";

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
    await attemptPushToBucket(psbt, bucket, feeRateThreshold);
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
  return {
    result: { finalTransaction, bucket, serviceFees, finalFeeRate, miningFees },
  };
};

async function mapPSBTToDensity(psbt: Psbt) {
  const psbtCopy = Psbt.fromBase64(psbt.toBase64(), { network: NETWORK });
  const inputValues = sumPSBTInputValues(psbtCopy);
  const index = await db.client.hGet(
    KEYS.PSBT.PREFIX + sha256(psbtCopy.toBase64()),
    "index",
  );

  if (isDefined(index)) {
    signAllInputs(
      psbtCopy,
      getSignerByIndex(hotWallet, index, NETWORK),
      getSignerByIndex(oldHotWallet, index, NETWORK),
    );
  }
  const tx = finalize(psbtCopy);
  const serviceFees = Math.round(inputValues * FEE);
  const miningFees = psbtCopy.getFee() - serviceFees;
  const feeRate = miningFees / tx.virtualSize();
  return {
    psbt,
    density: serviceFees / (1 / feeRate),
  };
}

async function attemptPushToBucket(
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
  } else {
    logger.info([
      `Skipping PSBT ${sha256(psbt.toBase64())} - Fee threshold is ${feeRateThreshold} but final fee rate is ${finalFeeRate}`,
    ]);
  }
}

async function finalizeBatch(bucket: Psbt[], serviceFees: number) {
  const stagedTx = new Psbt({ network: NETWORK });
  stagedTx.addInputs(
    bucket.map((e) => ({ ...e.txInputs[0], ...e.data.inputs[0] })),
  );
  stagedTx.addOutputs(bucket.map((e) => e.txOutputs[0]));
  const feeCollectorAddress = await getUnusedFeeAddress();
  if (!feeCollectorAddress) throw new Error("No fee collector address found");
  const inputSum = sumPSBTInputValues(stagedTx);
  const outputSum = sumPSBTOutputValues(stagedTx);
  if (serviceFees > DUST_LIMIT && inputSum - outputSum >= serviceFees) {
    stagedTx.addOutput({
      address: feeCollectorAddress,
      value: serviceFees,
    });
  }
  const indexes = await Promise.all(
    bucket.map((e) => {
      const id = sha256(e.toBase64());
      return db.client.hGet(KEYS.PSBT.PREFIX + id, "index");
    }),
  );
  signBatchedTransaction(stagedTx, indexes);
  const finalTransaction = finalize(stagedTx);
  return { stagedTx, finalTransaction };
}

async function getUTXOForInput(input: PsbtTxInput) {
  const inputTxId = getTxIdOfInput(input);
  const { result: tx } = await getTx(inputTxId);

  if (!tx) return undefined;

  const output = tx.vout[input.index];
  if (!output.scriptpubkey_address) return undefined;
  const { result: utxo } = await getUTXO(output.scriptpubkey_address);

  return utxo?.filter((utx) => utx.txid === inputTxId);
}

async function getUnusedFeeAddress() {
  const index = Number((await db.get(KEYS.FEE.INDEX)) || 0);
  const feeCollector = feeWallet.derivePath(`0/${index}`);

  return payments.p2wpkh({
    pubkey: feeCollector.publicKey,
    network: NETWORK,
  }).address;
}
