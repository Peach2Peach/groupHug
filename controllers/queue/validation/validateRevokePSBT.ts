import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { getExtraPSBTDataById } from '../../../src/utils/queue'
import { respondWithError } from '../../../src/utils/response/respondWithError'

const SHA256_LENGTH = 64
const REVOCATION_TOKEN_LENGTH = 32
export const validateRevokePSBT = async (req: Request, res: Response, next: NextFunction) => {
  const { id: idUnparsed, revocationToken: revocationTokenUnparsed } = req.body

  try {
    const id = z.string().length(SHA256_LENGTH)
      .parse(idUnparsed)
    const revocationToken = z.string().length(REVOCATION_TOKEN_LENGTH)
      .parse(revocationTokenUnparsed)

    const extraPSBTData = await getExtraPSBTDataById(id)
    if (!extraPSBTData) return respondWithError(res, 'BAD_REQUEST')
    if (extraPSBTData.revocationToken !== revocationToken) return respondWithError(res, 'BAD_REQUEST')

    return next()
  } catch (e) {
    return respondWithError(res, 'BAD_REQUEST')
  }
}
