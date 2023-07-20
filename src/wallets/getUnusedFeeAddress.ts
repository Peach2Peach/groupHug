import { db } from '../utils/db'
import { KEYS } from '../utils/db/keys'
import { getFeeAddress } from './getFeeAddress'

export const getUnusedFeeAddress = async () => {
  const index = await db.get(KEYS.FEE.INDEX)
  return getFeeAddress(Number(index || 0))
}
