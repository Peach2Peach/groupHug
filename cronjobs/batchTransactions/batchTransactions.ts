import { BUCKETS } from '../../constants'
import { getFeeEstimates } from '../../src/utils/electrs'
import getLogger from '../../src/utils/logger'
import { getPSBTsFromQueue } from '../../src/utils/queue'
import { getFeeRanges, getSteps, isBucketReadyForBatch } from './helpers'
import { batchBucket } from './batchBucket'

const logger = getLogger('job', 'batchTransactions')

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

  while (batchCandidates.length) {
    // eslint-disable-next-line no-await-in-loop
    await batchBucket(batchCandidates.pop())
  }
  return true
}
