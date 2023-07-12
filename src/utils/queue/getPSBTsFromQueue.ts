import { Psbt } from 'bitcoinjs-lib'
import { db } from '../db'
import { KEYS } from '../db/keys'

export const getPSBTsFromQueue = async (minFeeRate = 1, maxFeeRate: number = undefined) => {
  const base64s = await db.zrange(KEYS.PSBT.QUEUE, minFeeRate, maxFeeRate, true)
  return base64s.map((base64) => Psbt.fromBase64(base64))
}
