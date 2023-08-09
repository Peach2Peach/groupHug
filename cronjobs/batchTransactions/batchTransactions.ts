import { BATCH_SIZE_THRESHOLD, BUCKETS } from '../../constants'
import { getFeeEstimates, postTx } from '../../src/utils/electrs'
import getLogger from '../../src/utils/logger'
import { getFeeRanges, getPSBTsFromQueue, getSteps } from '../../src/utils/queue'
import { PSBTWithFeeRate } from '../../src/utils/queue/getPSBTsFromQueue'
import { saveBucketStatus } from '../../src/utils/queue/saveBucketStatus'
import { batchBucket } from './batchBucket'
import { errorFormatBatch, isBucketReadyForBatch, markBatchedTransactionAsPending } from './helpers'

const logger = getLogger('job', 'batchTransactions')

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
    const markResult = await markBatchedTransactionAsPending(candidate, index, txId)
    saveBucketStatus(index, 0, BATCH_SIZE_THRESHOLD)

    return markResult.isOk()
  }

  logger.error(['Could not broadcast batched transaction', JSON.stringify(result.getError())])
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
  buckets.forEach((bucket, i) => saveBucketStatus(i, bucket.length, BATCH_SIZE_THRESHOLD))

  const bucketReadyStates = await Promise.all(buckets.map(isBucketReadyForBatch))
  const batchCandidates = buckets.filter((_b, i) => bucketReadyStates[i])

  let success = true

  let i = 0
  while (batchCandidates.length) {
    logger.info(['Batching bucket', i + 1, 'with fee range', feeRanges[i]])

    // eslint-disable-next-line no-await-in-loop
    const result = await handleBatch(batchCandidates.shift(), i)
    if (result === false) success = false
    i++
  }
  return success
}
