/* eslint-disable prefer-destructuring */
import { AES, enc } from 'crypto-js'
import * as constants from '../../../constants'

export let DB_AUTH: string
export let PRIVKEY: string
export let FEE_COLLECTOR_PUBKEY: string
export let decrypted = false
export const setDecrypted = (d: boolean) => (decrypted = d)

const getConfig = () => ({
  DB_AUTH,
  PRIVKEY,
  FEE_COLLECTOR_PUBKEY,
})

export const decryptConfig = (password: string) => {
  setDecrypted(decrypted || !constants.PASSWORDPROTECTION)
  DB_AUTH = constants.DB_AUTH
  PRIVKEY = constants.PRIVKEY
  FEE_COLLECTOR_PUBKEY = constants.FEE_COLLECTOR_PUBKEY

  if (decrypted) return getConfig()

  try {
    if (AES.decrypt(constants.DB_AUTH, password).toString(enc.Utf8).length === 0) {
      throw new Error('Password invalid')
    }
  } catch (e) {
    throw new Error('Password invalid')
  }

  DB_AUTH = AES.decrypt(constants.DB_AUTH, password).toString(enc.Utf8)
  PRIVKEY = AES.decrypt(constants.PRIVKEY, password).toString(enc.Utf8)
  FEE_COLLECTOR_PUBKEY = AES.decrypt(constants.FEE_COLLECTOR_PUBKEY, password).toString(enc.Utf8)

  setDecrypted(true)
  return getConfig()
}
