import { Psbt } from "bitcoinjs-lib";
import { db } from "../db";
import { KEYS } from "../db/keys";
import { registerPSBTWithClient } from "./registerPSBTWithClient";

export const addPSBTToQueue = (psbt: Psbt, feeRate: number, index?: number) =>
  db.transaction(async (client) => {
    await client.zadd(KEYS.PSBT.QUEUE, feeRate, psbt.toBase64());
    return registerPSBTWithClient(client, psbt, index);
  });
