import { Psbt } from "bitcoinjs-lib";
import { NETWORK } from "../../../constants";
import { db } from "../db";
import { KEYS } from "../db/keys";

export const getPSBTsFromQueue = async () => {
  const entries = await db.smembers(KEYS.PSBT.QUEUE);
  return entries.map((value) => Psbt.fromBase64(value, { network: NETWORK }));
};
