import { AES } from 'crypto-js'
import { xpriv, xpub } from './walletData'

export const unencrypted: Record<string, string> = {
  DB_AUTH: 'DB_AUTH',
  PRIVKEY: xpriv,
  FEE_COLLECTOR_PUBKEY: xpub,
}
export const encrypted = Object.keys(unencrypted).reduce((obj, key) => {
  obj[key] = AES.encrypt(unencrypted[key], 'password').toString()
  return obj
}, {} as Record<string, string>)
