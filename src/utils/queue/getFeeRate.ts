import { db } from '../db'
import { KEYS } from '../db/keys'

export const getFeeRate = (psbt: string) => db.zscore(KEYS.PSBT.QUEUE, psbt)
