import { addPSBTToBatchWithClient } from "../../../src/utils/batch/addPSBTToBatchWithClient";
import { db } from "../../../src/utils/db";
import { KEYS } from "../../../src/utils/db/keys";

export const markBatchedTransactionAsPending = (
  candidate: string[],
  txId: string
) =>
  db.transaction(async (client) => {
    await Promise.all(
      candidate.map((psbt) => addPSBTToBatchWithClient(client, txId, psbt))
    );
    await Promise.all(
      candidate.map((base64Psbt) => db.client.sRem(KEYS.PSBT.QUEUE, base64Psbt))
    );
    await client.sadd(KEYS.TRANSACTION.PENDING, txId);
  });
