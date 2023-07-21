import { BUCKETS } from '../../constants'
import { getFeeEstimates, postTx } from '../../src/utils/electrs'
import getLogger from '../../src/utils/logger'
import { getPSBTsFromQueue } from '../../src/utils/queue'
import { PSBTWithFeeRate } from '../../src/utils/queue/getPSBTsFromQueue'
import { batchBucket } from './batchBucket'
import {
  errorFormatBatch,
  getFeeRanges,
  getSteps,
  isBucketReadyForBatch,
  markBatchedTransactionAsPending,
} from './helpers'

const logger = getLogger('job', 'batchTransactions')

const handleBatch = async (candidate: PSBTWithFeeRate[]) => {
  const batchBucketResult = await batchBucket(candidate)

  if (!batchBucketResult.isOk()) {
    logger.error(['Could not batch transaction', batchBucketResult.getError()])
    logger.error([JSON.stringify(errorFormatBatch(candidate))])
    return false
  }
  const batchedTransaction = batchBucketResult.getValue()
  const result = await postTx(batchedTransaction.toHex())

  if (result.isOk()) {
    const txId = result.getValue()
    const markResult = await markBatchedTransactionAsPending(candidate, txId)
    return markResult.isOk()
  }

  logger.error(['Could not broadcast batched transaction', JSON.stringify(result.getError())])
  logger.error([JSON.stringify(errorFormatBatch(candidate))])
  return false
}

export const batchTransactions = async () => {
  logger.debug('Start batch process')

  const feeEstimatesResult = await getFeeEstimates()

  if (feeEstimatesResult.isError()) {
    logger.error(['Could not get fee estimates', feeEstimatesResult.getError()])
    return false
  }

  const { fastestFee } = feeEstimatesResult.getValue()
  const feeRanges = getFeeRanges(getSteps(fastestFee, BUCKETS))
  const buckets = await Promise.all(feeRanges.map(([min, max]) => getPSBTsFromQueue(min, max)))
  const batchCandidates = await Promise.all(buckets.filter(isBucketReadyForBatch))
  let success = true

  while (batchCandidates.length) {
    // eslint-disable-next-line no-await-in-loop
    const result = await handleBatch(batchCandidates.pop())
    if (result === false) success = false
  }
  return success
}
