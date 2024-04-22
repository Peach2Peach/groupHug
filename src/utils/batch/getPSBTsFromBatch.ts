import { Network, Psbt } from "bitcoinjs-lib";
import { db } from "../db";
import { KEYS } from "../db/keys";

export const getPSBTsFromBatch = async (txId: string, network: Network) => {
  const base64s = await db.zrange(KEYS.BATCH + txId);
  return base64s.map((base64) => Psbt.fromBase64(base64, { network }));
};
