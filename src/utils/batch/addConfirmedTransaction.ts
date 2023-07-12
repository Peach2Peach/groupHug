import { db } from '../db'
import { SubClient } from '../db/SubClient'
import { KEYS } from '../db/keys'

export const addConfirmedTransactionWithClient = async (client: SubClient, txId: string) => {
  await client.srem(KEYS.TRANSACTION.PENDING, txId)
  await client.sadd(KEYS.TRANSACTION.CONFIRMED, txId)
}

export const addConfirmedTransaction = (txId: string) =>
  db.transaction((client) => addConfirmedTransactionWithClient(client, txId))
