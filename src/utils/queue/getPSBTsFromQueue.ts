import { Psbt } from "bitcoinjs-lib";
import { NETWORK } from "../../../constants";
import { db } from "../db";
import { KEYS } from "../db/keys";

export type PSBTWithFeeRate = {
  feeRate: number;
  psbt: Psbt;
};
export const getPSBTsFromQueue = async () => {
  const entries = await db.zrangewithscores(KEYS.PSBT.QUEUE);
  return entries.map(({ score: feeRate, value }) => ({
    feeRate,
    psbt: Psbt.fromBase64(value, { network: NETWORK }),
  }));
};
