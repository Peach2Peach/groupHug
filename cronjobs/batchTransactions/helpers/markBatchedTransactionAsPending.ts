import {
  addPendingTransactionWithClient,
  addPSBTToBatchWithClient,
} from "../../../src/utils/batch";
import { db } from "../../../src/utils/db";
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
    await Promise.all([addPendingTransactionWithClient(client, txId)]);
  });
