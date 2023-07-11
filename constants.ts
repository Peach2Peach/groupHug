import { Network, networks } from 'bitcoinjs-lib'
import { AES, enc } from 'crypto-js'
import { loadDotenv } from './src/utils/dotenv'
import BIP32Factory, { BIP32Interface } from 'bip32'
import * as ecc from 'tiny-secp256k1'

const bip32 = BIP32Factory(ecc)

loadDotenv()

const DEFAULTS = {
  MAXREQUESTRATE: 10,
}

export const PASSWORDPROTECTION = process.env.PASSWORDPROTECTION !== 'false'

export const MAXREQUESTRATE = process.env.MAXREQUESTRATE ? Number(process.env.MAXREQUESTRATE) : DEFAULTS.MAXREQUESTRATE

export const SATSINBTC = 100000000
export const NETWORKID = process.env.NETWORK
export let NETWORK =
  NETWORKID === 'testnet' ? networks.testnet : NETWORKID === 'regtest' ? networks.regtest : networks.bitcoin
export const setNetwork = (network: Network) => (NETWORK = network)

export const {
  NODE_ENV,
  PORT,
  DB_HOST,
  DB_PORT,
  ZAMMAD_API_URL,
  BLOCKEXPLORERURL,
  LATESTAPPVERSION,
  BITCOINRPCURL,
  BITCOINRPCPORT,
  BITCOINRPCUSER,
  BITCOINRPCPASS,
  TIMEOUTDURATION,
  LOGOSDIR,
  OPENEXCHANGERATESAPIKEY,
  CURRENCYBEACONAPIKEY,
} = process.env

// encrypted stuff
export let { DB_AUTH, ESCROW_PRIVKEY, FEE_COLLECTOR_PUBKEY } = process.env

export let decrypted = !PASSWORDPROTECTION
export const decryptConfig = (password: string) => {
  if (decrypted) return true

  if (AES.decrypt(DB_AUTH, password).toString(enc.Utf8).length === 0) return false

  DB_AUTH = AES.decrypt(DB_AUTH, password).toString(enc.Utf8)
  ESCROW_PRIVKEY = AES.decrypt(ESCROW_PRIVKEY, password).toString(enc.Utf8)
  FEE_COLLECTOR_PUBKEY = AES.decrypt(FEE_COLLECTOR_PUBKEY, password).toString(enc.Utf8)

  decrypted = true
  return decrypted
}

export const FEE = Number(process.env.FEE) / 100

export let hotWallet: BIP32Interface
export let feeWallet: BIP32Interface

export const loadHotWallet = (xprv: string): BIP32Interface => {
  hotWallet = bip32.fromBase58(xprv, NETWORK)
  return hotWallet
}

export const loadFeeWallet = (xpub: string): BIP32Interface => {
  feeWallet = bip32.fromBase58(xpub, NETWORK)
  return feeWallet
}

export const initEscrow = () => {
  loadHotWallet(ESCROW_PRIVKEY)
  loadFeeWallet(FEE_COLLECTOR_PUBKEY)
}

if (!PASSWORDPROTECTION) initEscrow()
