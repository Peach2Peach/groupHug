import { db } from '../db'
import { KEYS } from '../db/keys'

export const saveBucketStatus = (index: number, participants: number, maxParticipants: number) =>
  db.transaction((client) => client.hset(KEYS.BUCKET.STATUS + String(index), { participants, maxParticipants }))
