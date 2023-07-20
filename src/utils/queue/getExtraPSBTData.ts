import { Psbt } from 'bitcoinjs-lib'
import { sha256 } from '../crypto'
import { db } from '../db'
import { KEYS } from '../db/keys'

export const getExtraPSBTData = (psbt: Psbt) => {
  const id = sha256(psbt.toBase64())
  return db.hgetall(KEYS.PSBT.PREFIX + id)
}
