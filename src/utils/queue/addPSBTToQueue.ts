import { Psbt } from 'bitcoinjs-lib'
import { db } from '../db'
import { SubClient } from '../db/SubClient'
import { KEYS } from '../db/keys'
import { registerPSBTWithClient } from './registerPSBT'

export const addPSBTToQueueWithClient = (client: SubClient, psbt: Psbt, feeRate: number) =>
  client.zadd(KEYS.PSBT.QUEUE, feeRate, psbt.toBase64())

export const addPSBTToQueue = (psbt: Psbt, feeRate: number) =>
  db.transaction(async (client) => {
    await addPSBTToQueueWithClient(client, psbt, feeRate)
    return registerPSBTWithClient(client, psbt)
  })
