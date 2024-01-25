import { BATCH_SIZE_THRESHOLD, BUCKETS } from '../../constants'
import { getFeeEstimates, postTx } from '../../src/utils/electrs'
import getLogger from '../../src/utils/logger'
import { getFeeRanges, getPSBTsFromQueue, getSteps, resetBucketExpiration } from '../../src/utils/queue'
import { PSBTWithFeeRate } from '../../src/utils/queue/getPSBTsFromQueue'
import { saveBucketStatus } from '../../src/utils/queue/saveBucketStatus'
import { batchBucket } from './batchBucket'
import {
  errorFormatBatch,
  hasBucketReachedTimeThreshold,
  isBucketReadyForBatch,
  markBatchedTransactionAsPending,
} from './helpers'

export const logger = getLogger('job', 'batchTransactions')

const handleBatch = async (candidate: PSBTWithFeeRate[], index: number) => {
  logger.debug(['Batching bucket:', index, 'candidates:', candidate.length])

  const batchBucketResult = await batchBucket(candidate)

  if (!batchBucketResult.isOk()) {
    logger.error(['Could not batch transaction', batchBucketResult.getError()])
    logger.error([JSON.stringify(errorFormatBatch(candidate))])
    return false
  }
  const batchedTransaction = batchBucketResult.getValue()
  const result = await postTx(batchedTransaction.toHex())

  if (result.isOk()) {
    logger.info(['Transaction succesfully batched for bucket', index])

    const txId = result.getValue()
    const markResult = await markBatchedTransactionAsPending(candidate, txId)
    saveBucketStatus({ index, participants: 0, maxParticipants: BATCH_SIZE_THRESHOLD })

    return markResult.isOk()
  }

  logger.error([
    'Could not broadcast batched transaction',
    JSON.stringify(result.getError()),
    batchedTransaction.toHex(),
  ])
  logger.error([JSON.stringify(errorFormatBatch(candidate))])
  return false
}

export const batchTransactions = async () => {
  const feeEstimatesResult = await getFeeEstimates()

  if (feeEstimatesResult.isError()) {
    logger.error(['Could not get fee estimates', feeEstimatesResult.getError()])
    return false
  }

  const { fastestFee } = feeEstimatesResult.getValue()
  const feeRanges = getFeeRanges(getSteps(fastestFee, BUCKETS)).reverse()
  const buckets = await Promise.all(feeRanges.map(([min, max]) => getPSBTsFromQueue(min, max)))
  buckets.forEach((bucket, i) =>
    saveBucketStatus({
      index: i,
      participants: bucket.length,
      maxParticipants: BATCH_SIZE_THRESHOLD,
      feeRange: feeRanges[i],
    }),
  )

  const timeThresholdReached = await hasBucketReachedTimeThreshold()

  const results = await Promise.all(
    buckets.map((bucket, i) => {
      if (!timeThresholdReached && !isBucketReadyForBatch(bucket)) {
        logger.info(['Bucket', i, 'not ready to be batched'])
        return true
      }
      logger.info(['Batching bucket', i, 'with fee range', feeRanges[i]])
      return handleBatch(bucket, i)
    }),
  )
  const success = results.every((r) => r === true)

  if (timeThresholdReached) await resetBucketExpiration()

  return success
}
