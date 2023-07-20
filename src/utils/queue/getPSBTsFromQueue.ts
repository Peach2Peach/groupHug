import { Psbt } from 'bitcoinjs-lib'
import { db } from '../db'
import { KEYS } from '../db/keys'

export type PSBTWithFeeRate = {
  feeRate: number
  psbt: Psbt
}
const MARGIN = 0.001
export const getPSBTsFromQueue = async (minFeeRate = 1, maxFeeRate: number = undefined): Promise<PSBTWithFeeRate[]> => {
  const entries = await db.zrangewithscores(
    KEYS.PSBT.QUEUE,
    minFeeRate,
    maxFeeRate ? maxFeeRate - MARGIN : undefined,
    true,
  )
  return entries.map(({ score: feeRate, value }) => ({ feeRate, psbt: Psbt.fromBase64(value) }))
}
