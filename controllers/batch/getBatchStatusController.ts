import { NETWORK } from '../../constants'
import { getPSBTsFromBatch } from '../../src/utils/batch'
import { getBucketStatus, getExtraPSBTDataById, getFeeRate } from '../../src/utils/queue'
import { getBucketIndexByFeeRate } from '../../src/utils/queue/getBucketIndexByFeeRate'
import { PSBTInfo } from '../../src/utils/queue/getExtraPSBTDataById'
import { respondWithError } from '../../src/utils/response'
import { GetBatchStatusRequest, GetBatchStatusResponse } from './types'

const getCompletedBatchStatus = async (psbtInfo: PSBTInfo) => {
  const participants = await getPSBTsFromBatch(psbtInfo.txId, NETWORK)
  return {
    participants: participants.length,
    maxParticipants: participants.length,
    timeRemaining: 0,
    completed: true,
    txId: psbtInfo.txId,
  }
}

export const getBatchStatusController = async (req: GetBatchStatusRequest, res: GetBatchStatusResponse) => {
  const { feeRate: feeRateString, id } = req.query
  let feeRate = Number(feeRateString || 0)

  if (id) {
    const psbtInfo = await getExtraPSBTDataById(id)
    if (!psbtInfo) return respondWithError(res, 'NOT_FOUND')
    if (psbtInfo.txId) return res.json(await getCompletedBatchStatus(psbtInfo))

    feeRate = await getFeeRate(psbtInfo.psbt)
  }

  const index = await getBucketIndexByFeeRate(Number(feeRate))
  if (index === undefined) return respondWithError(res, 'INTERNAL_SERVER_ERROR')

  const bucketStatus = await getBucketStatus(index)
  if (!bucketStatus) return respondWithError(res, 'NOT_FOUND')

  return res.json(bucketStatus)
}
