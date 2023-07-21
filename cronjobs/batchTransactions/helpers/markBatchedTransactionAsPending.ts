import { addPSBTToBatchWithClient, addPendingTransactionWithClient } from '../../../src/utils/batch'
import { db } from '../../../src/utils/db'
import { removePSBTFromQueueWithClient } from '../../../src/utils/queue'
import { PSBTWithFeeRate } from '../../../src/utils/queue/getPSBTsFromQueue'
import { resetBucketExpirationWithClient } from '../../../src/utils/queue/resetBucketExpiration'

export const markBatchedTransactionAsPending = (candidate: PSBTWithFeeRate[], index: number, txId: string) =>
  db.transaction(async (client) => {
    await Promise.all(candidate.map(({ psbt, feeRate }) => addPSBTToBatchWithClient(client, txId, psbt, feeRate)))
    await Promise.all(candidate.map(({ psbt }) => removePSBTFromQueueWithClient(client, psbt)))
    await Promise.all([addPendingTransactionWithClient(client, txId), resetBucketExpirationWithClient(client, index)])
  })
