import { addPSBTToBatchWithClient } from "../../../src/utils/batch/addPSBTToBatchWithClient";
import { db } from "../../../src/utils/db";
import { KEYS } from "../../../src/utils/db/keys";
import { removePSBTFromQueueWithClient } from "../../../src/utils/queue";
import { PSBTWithFeeRate } from "../../../src/utils/queue/getPSBTsFromQueue";

export const markBatchedTransactionAsPending = (
  candidate: PSBTWithFeeRate[],
  txId: string
) =>
  db.transaction(async (client) => {
    await Promise.all(
      candidate.map(({ psbt, feeRate }) =>
        addPSBTToBatchWithClient(client, txId, psbt, feeRate)
      )
    );
    await Promise.all(
      candidate.map(({ psbt }) => removePSBTFromQueueWithClient(client, psbt))
    );
    await client.sadd(KEYS.TRANSACTION.PENDING, txId);
  });
