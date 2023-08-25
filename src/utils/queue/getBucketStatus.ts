import { db } from '../db'
import { KEYS } from '../db/keys'

export const getBucketStatus = async (index: number) => {
  const rawInfo = await db.hgetall(KEYS.BUCKET.STATUS + String(index))
  if (!rawInfo) return null

  const ttl = await db.client.ttl(KEYS.BUCKET.EXPIRATION + String(index))

  return {
    participants: Number(rawInfo.participants),
    maxParticipants: Number(rawInfo.maxParticipants),
    feeRange: rawInfo.feeRange ? rawInfo.feeRange.split(',').map(Number) : [NaN, NaN],
    timeRemaining: ttl,
    completed: false,
  }
}
