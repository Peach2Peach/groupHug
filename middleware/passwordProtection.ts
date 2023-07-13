import { Request, Response } from 'express'
import { decrypted } from '../constants'
import { respondWithError } from '../src/utils/response'

export const passwordProtection = (req: Request, res: Response, next: Function) => {
  if (decrypted || req.url === '/v1/start') {
    return next()
  }
  return respondWithError(res, 'SERVICE_UNAVAILABLE')
}
