import { Network, Transaction, networks } from 'bitcoinjs-lib'
import { loadDotenv } from './src/utils/dotenv'
import BIP32Factory from 'bip32'
import * as ecc from 'tiny-secp256k1'

export const bip32 = BIP32Factory(ecc)

loadDotenv()

const DEFAULTS = {
  DB_HOST: 'localhost',
  DB_PORT: 6379,
  MAXREQUESTRATE: 10,
  MAX_BATCH_SIZE: 100,
  MAX_BATCH_TIME: 43200,
  FEE: 2,
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
  DB_HOST = DEFAULTS.DB_HOST,
  DB_PORT = DEFAULTS.DB_PORT,
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
  LOGLEVEL_ERROR,
  LOGLEVEL_WARN,
  LOGLEVEL_HTTP,
  LOGLEVEL_INFO,
  LOGLEVEL_DEBUG,
} = process.env

// possibly encrypted
export const { DB_AUTH, PRIVKEY, FEE_COLLECTOR_PUBKEY } = process.env

export const MAX_BATCH_SIZE = Number(process.env.MAX_BATCH_SIZE || DEFAULTS.MAX_BATCH_SIZE)
export const MAX_BATCH_TIME = Number(process.env.MAX_BATCH_TIME || DEFAULTS.MAX_BATCH_TIME)
export let FEE = Number(process.env.FEE || DEFAULTS.FEE) / 100
export const setFee = (fee: number) => (FEE = fee)

export const SIGHASH = {
  ALL: Transaction.SIGHASH_ALL,
  SINGLE_ANYONECANPAY: Transaction.SIGHASH_SINGLE + Transaction.SIGHASH_ANYONECANPAY,
}

export const RESPONSE_CODES = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
}
