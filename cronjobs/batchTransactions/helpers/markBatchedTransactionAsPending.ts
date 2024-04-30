import { Psbt } from "bitcoinjs-lib";
import { addPSBTToBatchWithClient } from "../../../src/utils/batch/addPSBTToBatchWithClient";
import { db } from "../../../src/utils/db";
import { KEYS } from "../../../src/utils/db/keys";

export const markBatchedTransactionAsPending = (
  candidate: Psbt[],
  txId: string
) =>
  db.transaction(async (client) => {
    await Promise.all(
      candidate.map((psbt) => addPSBTToBatchWithClient(client, txId, psbt))
    );
    await Promise.all(
      candidate.map((psbt) => db.client.sRem(KEYS.PSBT.QUEUE, psbt.toBase64()))
    );
    await client.sadd(KEYS.TRANSACTION.PENDING, txId);
  });
