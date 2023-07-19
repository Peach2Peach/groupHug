import { Psbt } from 'bitcoinjs-lib'
import { getTx } from '../../src/utils/electrs'
import { addPSBTToQueue } from '../../src/utils/queue'
import { respondWithError } from '../../src/utils/response'
import { AddPSBTRequest, AddPSBTResponse } from './types'

export const addPSBTController = async (req: AddPSBTRequest, res: AddPSBTResponse) => {
  const { psbt: base64, feeRate } = req.body

  // TODO check network argument on every instance
  const psbt = Psbt.fromBase64(base64)

  const results = await Promise.all(psbt.txInputs.map((input) => getTx(input.hash.toString('hex'))))
  const transactions = results.map((result) => result.getValue())
  if (transactions.every((t) => t) && transactions.some((tx) => !tx.status.confirmed)) {
    return respondWithError(res, 'BAD_REQUEST')
  }

  const result = await addPSBTToQueue(psbt, feeRate)
  if (result.isError()) return respondWithError(res, 'INTERNAL_SERVER_ERROR')

  const { id, revocationToken } = result.getResult()
  return res.json({
    id,
    revocationToken,
  })
}
