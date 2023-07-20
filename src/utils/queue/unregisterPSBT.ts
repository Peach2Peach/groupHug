import { Psbt } from 'bitcoinjs-lib'
import { sha256 } from '../crypto'
import { db } from '../db'
import { SubClient } from '../db/SubClient'
import { KEYS } from '../db/keys'

export const unregisterPSBTWithClient = async (client: SubClient, psbt: Psbt) => {
  const base64 = psbt.toBase64()
  const id = sha256(base64)

  await client.del(KEYS.PSBT.PREFIX + id)
}

export const unregisterPSBT = (psbt: Psbt) => db.transaction((client) => unregisterPSBTWithClient(client, psbt))
