import { AES } from 'crypto-js'
import { xpriv, xpub } from './walletData'

export const unencrypted = {
  DB_AUTH: 'DB_AUTH',
  PRIVKEY: xpriv,
  FEE_COLLECTOR_PUBKEY: xpub,
}
export const encrypted = {
  DB_AUTH: AES.encrypt('DB_AUTH', 'password').toString(),
  PRIVKEY: AES.encrypt(xpriv, 'password').toString(),
  FEE_COLLECTOR_PUBKEY: AES.encrypt(xpub, 'password').toString(),
}
