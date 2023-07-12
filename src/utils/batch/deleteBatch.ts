import { db } from '../db'
import { SubClient } from '../db/SubClient'
import { KEYS } from '../db/keys'

export const deleteBatchWithClient = (client: SubClient, txId: string) => client.del(KEYS.BATCH + txId)

export const deleteBatch = (txId: string) => db.transaction((client) => deleteBatchWithClient(client, txId))
