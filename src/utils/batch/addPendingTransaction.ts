import { db } from "../db";
import { SubClient } from "../db/SubClient";
import { KEYS } from "../db/keys";

export const addPendingTransactionWithClient = (
  client: SubClient,
  txId: string,
) => client.sadd(KEYS.TRANSACTION.PENDING, txId);

export const addPendingTransaction = (txId: string) =>
  db.transaction((client) => addPendingTransactionWithClient(client, txId));
