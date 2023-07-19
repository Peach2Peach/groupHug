import { db } from '../../../src/utils/db'
import { KEYS } from '../../../src/utils/db/keys'

export const hasBucketReachedTimeThreshold = async (index: number) =>
  !(await db.exists(KEYS.BUCKET.EXPIRATION + String(index)))
