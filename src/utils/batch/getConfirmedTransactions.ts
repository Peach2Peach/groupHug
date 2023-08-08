import { db } from '../db'
import { KEYS } from '../db/keys'

export const getConfirmedTransactions = () => db.smembers(KEYS.TRANSACTION.CONFIRMED)
