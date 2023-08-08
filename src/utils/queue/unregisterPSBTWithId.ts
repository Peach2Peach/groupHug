import { db } from '../db'
import { SubClient } from '../db/SubClient'
import { KEYS } from '../db/keys'

export const unregisterPSBTWithIdWithClient = async (client: SubClient, id: string) => {
  await client.del(KEYS.PSBT.PREFIX + id)
}

export const unregisterPSBTWithId = (id: string) =>
  db.transaction((client) => unregisterPSBTWithIdWithClient(client, id))
