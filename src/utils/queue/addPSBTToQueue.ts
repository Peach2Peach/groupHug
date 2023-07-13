import { Psbt } from 'bitcoinjs-lib'
import { db } from '../db'
import { SubClient } from '../db/SubClient'
import { KEYS } from '../db/keys'

export const addPSBTToQueueWithClient = (client: SubClient, psbt: Psbt, feeRate: number) =>
  client.zadd(KEYS.PSBT.QUEUE, feeRate, psbt.toBase64())

export const addPSBTToQueue = (psbt: Psbt, feeRate: number) =>
  db.transaction((client) => addPSBTToQueueWithClient(client, psbt, feeRate))