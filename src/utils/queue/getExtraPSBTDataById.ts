import { db } from '../db'
import { KEYS } from '../db/keys'

type PSBTInfo = {
  psbt: string
  index: number
  revocationToken: string
}
export const getExtraPSBTDataById = async (id: string): Promise<PSBTInfo> => {
  const rawInfo = await db.hgetall(KEYS.PSBT.PREFIX + id)
  if (!rawInfo) return null

  return {
    psbt: rawInfo.psbt,
    revocationToken: rawInfo.revocationToken,
    index: Number(rawInfo.index),
  }
}
