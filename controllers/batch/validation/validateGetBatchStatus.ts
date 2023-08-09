import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { respondWithError } from '../../../src/utils/response'

export const validateGetBatchStatus = (req: Request, res: Response, next: NextFunction) => {
  const { feeRate: feeRateUnparsed } = req.query

  try {
    z.number().gte(1)
      .parse(Number(feeRateUnparsed))
    return next()
  } catch (e) {
    return respondWithError(res, 'BAD_REQUEST')
  }
}
