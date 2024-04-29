import { Psbt } from "bitcoinjs-lib";
import { db } from "../db";
import { KEYS } from "../db/keys";
import { registerPSBTWithClient } from "./registerPSBTWithClient";

export const addPSBTToQueue = (psbt: Psbt, feeRate: number, index?: number) => {
  const base64 = psbt.toBase64();
  return db.transaction(async (client) => {
    await client.zadd(KEYS.PSBT.QUEUE, feeRate, base64);
    return registerPSBTWithClient(client, base64, index);
  });
};
