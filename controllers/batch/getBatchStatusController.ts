import { getBucketStatus, getExtraPSBTDataById, getFeeRate } from '../../src/utils/queue'
import { getBucketIndexByFeeRate } from '../../src/utils/queue/getBucketIndexByFeeRate'
import { respondWithError } from '../../src/utils/response'
import { GetBatchStatusRequest, GetBatchStatusResponse } from './types'

export const getBatchStatusController = async (req: GetBatchStatusRequest, res: GetBatchStatusResponse) => {
  const { feeRate: feeRateString, id } = req.query
  let feeRate = Number(feeRateString || 0)

  if (id) {
    const psbtInfo = await getExtraPSBTDataById(id)
    if (!psbtInfo) return respondWithError(res, 'NOT_FOUND')
    feeRate = await getFeeRate(psbtInfo.psbt)
  }

  const index = await getBucketIndexByFeeRate(Number(feeRate))
  if (index === undefined) return respondWithError(res, 'INTERNAL_SERVER_ERROR')

  const bucketStatus = await getBucketStatus(index)
  if (!bucketStatus) return respondWithError(res, 'NOT_FOUND')

  return res.json(bucketStatus)
}
