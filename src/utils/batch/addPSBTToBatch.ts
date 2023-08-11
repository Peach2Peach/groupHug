import { Psbt } from 'bitcoinjs-lib'
import { sha256 } from '../crypto'
import { db } from '../db'
import { SubClient } from '../db/SubClient'
import { KEYS } from '../db/keys'

export const addPSBTToBatchWithClient = (client: SubClient, txId: string, psbt: Psbt, feeRate: number) => {
  const base64 = psbt.toBase64()
  const id = sha256(base64)
  return Promise.all([client.zadd(KEYS.BATCH + txId, feeRate, base64), client.hset(KEYS.PSBT.PREFIX + id, { txId })])
}
export const addPSBTToBatch = (txId: string, psbt: Psbt, feeRate: number) =>
  db.transaction((client) => addPSBTToBatchWithClient(client, txId, psbt, feeRate))
