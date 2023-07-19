import { Psbt } from 'bitcoinjs-lib'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { finalize, isSignedWithSighash, signAllInputs, validatePSBTSignatures } from '../../../src/utils/psbt'
import { respondWithError } from '../../../src/utils/response/respondWithError'
import { hotWallet } from '../../../src/wallets'

export const validatePSBT = (req: Request, res: Response, next: NextFunction) => {
  const { psbt: base64Unparsed, feeRate: feeRateUnparsed } = req.body

  try {
    const feeRate = z.number().gte(1)
      .parse(feeRateUnparsed)
    const base64 = z.string().nonempty()
      .parse(base64Unparsed)
    const psbt = Psbt.fromBase64(base64)

    if (!validatePSBTSignatures(psbt)) return respondWithError(res, 'BAD_REQUEST')
    if (psbt.txInputs.length !== 1) return respondWithError(res, 'BAD_REQUEST')
    if (psbt.txOutputs.length !== 1) return respondWithError(res, 'BAD_REQUEST')
    if (!isSignedWithSighash(psbt, 'SINGLE_ANYONECANPAY')) return respondWithError(res, 'BAD_REQUEST')

    signAllInputs(psbt, hotWallet)
    finalize(psbt)

    if (feeRate > psbt.getFeeRate()) return respondWithError(res, 'BAD_REQUEST')
    return next()
  } catch (e) {
    return respondWithError(res, 'BAD_REQUEST')
  }
}
