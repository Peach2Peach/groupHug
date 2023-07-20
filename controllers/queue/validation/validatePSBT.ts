import { Psbt } from 'bitcoinjs-lib'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { finalize, isSignedWithSighash, signAllInputs, validatePSBTSignatures } from '../../../src/utils/psbt'
import { respondWithError } from '../../../src/utils/response/respondWithError'
import { getSignerByIndex, hotWallet } from '../../../src/wallets'
import { NETWORK } from '../../../constants'

export const validatePSBT = (req: Request, res: Response, next: NextFunction) => {
  const { psbt: base64Unparsed, feeRate: feeRateUnparsed, index: indexUnparsed } = req.body

  try {
    const feeRate = z.number().gte(1)
      .parse(feeRateUnparsed)
    const base64 = z.string().nonempty()
      .parse(base64Unparsed)
    const index = z.number().gte(0)
      .parse(indexUnparsed)
    const psbt = Psbt.fromBase64(base64)

    if (psbt.txInputs.length !== 1) return respondWithError(res, 'BAD_REQUEST')
    if (psbt.txOutputs.length !== 1) return respondWithError(res, 'BAD_REQUEST')
    if (!validatePSBTSignatures(psbt)) return respondWithError(res, 'BAD_REQUEST')
    if (!isSignedWithSighash(psbt, 'SINGLE_ANYONECANPAY')) return respondWithError(res, 'BAD_REQUEST')

    signAllInputs(psbt, getSignerByIndex(hotWallet, index, NETWORK))
    finalize(psbt)

    if (feeRate > psbt.getFeeRate()) return respondWithError(res, 'BAD_REQUEST')
    return next()
  } catch (e) {
    return respondWithError(res, 'BAD_REQUEST')
  }
}
