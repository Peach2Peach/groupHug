import { db } from "../db";
import { KEYS } from "../db/keys";

export const getPendingTransactions = () =>
  db.smembers(KEYS.TRANSACTION.PENDING);
