import { Psbt } from 'bitcoinjs-lib'
import { SubClient } from '../db/SubClient'
import { db } from '../db'
import { KEYS } from '../db/keys'
import { unregisterPSBTWithClient } from './unregisterPSBT'

export const removePSBTFromQueueWithClient = (client: SubClient, psbt: Psbt) =>
  client.zrem(KEYS.PSBT.QUEUE, psbt.toBase64())

export const removePSBTFromQueue = (psbt: Psbt) =>
  db.transaction((client) => {
    removePSBTFromQueueWithClient(client, psbt)
    return unregisterPSBTWithClient(client, psbt)
  })
