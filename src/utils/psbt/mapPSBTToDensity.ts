import { Psbt } from "bitcoinjs-lib";
import { finalize, signAllInputs } from ".";
import { FEE, NETWORK } from "../../../constants";
import { sumPSBTInputValues } from "../../../cronjobs/batchTransactions/helpers/sumPSBTInputValues";
import { getSignerByIndex } from "../../wallets/getSignerByIndex";
import { hotWallet, oldHotWallet } from "../../wallets/hotWallet";
import { sha256 } from "../crypto/sha256";
import { db } from "../db";
import { KEYS } from "../db/keys";
import { isDefined } from "../validation";

export async function mapPSBTToDensity(psbt: Psbt) {
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
