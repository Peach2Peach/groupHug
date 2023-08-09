import { getBucketStatus } from '../../src/utils/queue'
import { getBucketIndexByFeeRate } from '../../src/utils/queue/getBucketIndexByFeeRate'
import { respondWithError } from '../../src/utils/response'
import { GetBatchStatusRequest, GetBatchStatusResponse } from './types'

export const getBatchStatusController = async (req: GetBatchStatusRequest, res: GetBatchStatusResponse) => {
  const { feeRate } = req.query

  const index = await getBucketIndexByFeeRate(Number(feeRate))

  if (index === undefined) return respondWithError(res, 'INTERNAL_SERVER_ERROR')

  const bucketStatus = await getBucketStatus(index)
  if (!bucketStatus) return respondWithError(res, 'NOT_FOUND')

  return res.json(bucketStatus)
}
