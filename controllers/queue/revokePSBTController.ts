import { removePSBTFromQueueWithId } from '../../src/utils/queue'
import { RevokePSBTRequest, RevokePSBTResponse } from './types'

export const revokePSBTController = async (req: RevokePSBTRequest, res: RevokePSBTResponse) => {
  const { id } = req.body

  const result = await removePSBTFromQueueWithId(id)
  return res.json({ success: result.isOk() })
}
