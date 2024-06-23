import { payments, Psbt } from "bitcoinjs-lib";
import { DUST_LIMIT, NETWORK } from "../../constants";
import { sha256 } from "../../src/utils/crypto/sha256";
import { db } from "../../src/utils/db";
import { KEYS } from "../../src/utils/db/keys";
import { finalize } from "../../src/utils/psbt";
import { feeWallet } from "../../src/wallets/feeWallet";
import { signBatchedTransaction } from "./helpers/signBatchedTransaction";
import { sumPSBTInputValues } from "./helpers/sumPSBTInputValues";
import { sumPSBTOutputValues } from "./helpers/sumPSBTOutputValues";

export async function finalizeBatch(bucket: Psbt[], serviceFees: number) {
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

async function getUnusedFeeAddress() {
  const index = Number((await db.client.get(KEYS.FEE.INDEX)) || 0);
  const feeCollector = feeWallet.derivePath(`0/${index}`);

  return payments.p2wpkh({
    pubkey: feeCollector.publicKey,
    network: NETWORK,
  }).address;
}
