import { Psbt } from 'bitcoinjs-lib'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { NETWORK } from '../../../constants'
import { finalize, isSignedWithSighash, signAllInputs, validatePSBTSignatures } from '../../../src/utils/psbt'
import { respondWithError } from '../../../src/utils/response/respondWithError'
import { FeeRateSchema } from '../../../src/utils/validation/schemas'
import { getSignerByIndex, hotWallet } from '../../../src/wallets'

const DISCOUNT = 40

export const validatePSBT = (req: Request, res: Response, next: NextFunction) => {
  const { psbt: base64Unparsed, feeRate: feeRateUnparsed, index: indexUnparsed } = req.body

  try {
    const feeRate = FeeRateSchema.parse(feeRateUnparsed)
    const base64 = z.string().nonempty()
      .parse(base64Unparsed)
    const index = indexUnparsed ? z.number().gte(0)
      .parse(indexUnparsed) : undefined
    const psbt = Psbt.fromBase64(base64, { network: NETWORK })

    if (psbt.txInputs.length !== 1) return respondWithError(res, 'BAD_REQUEST')
    if (psbt.txOutputs.length !== 1) return respondWithError(res, 'BAD_REQUEST')
    if (!validatePSBTSignatures(psbt)) return respondWithError(res, 'BAD_REQUEST')
    if (!isSignedWithSighash(psbt, 'SINGLE_ANYONECANPAY')) return respondWithError(res, 'BAD_REQUEST')

    if (index) signAllInputs(psbt, getSignerByIndex(hotWallet, index, NETWORK))

    const tx = finalize(psbt)
    const userFee = tx.virtualSize() * feeRate
    const finalFee = psbt.getFee() - DISCOUNT * feeRate

    if (userFee >= finalFee) return respondWithError(res, 'BAD_REQUEST')
    return next()
  } catch (e) {
    return respondWithError(res, 'BAD_REQUEST')
  }
}
