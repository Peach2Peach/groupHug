import { db } from "../db";
import { KEYS } from "../db/keys";

export const addConfirmedTransaction = (txId: string) =>
  db.transaction(async (client) => {
    await client.srem(KEYS.TRANSACTION.PENDING, txId);
    await client.sadd(KEYS.TRANSACTION.CONFIRMED, txId);
  });
