import BIP32Factory from "bip32";
import { Network, networks, Transaction } from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import { loadDotenv } from "./src/utils/dotenv";

export const bip32 = BIP32Factory(ecc);

loadDotenv();

const DEFAULTS = {
  PORT: 8080,
  DB_HOST: "localhost",
  DB_PORT: 6379,
  MAXREQUESTRATE: 10,
  BATCH_TIME_THRESHOLD: 86400,
  BATCH_EXPIRATION_TIME: 604800,
  FEE: 0.02,
};

export const PASSWORDPROTECTION = process.env.PASSWORDPROTECTION !== "false";

export const MINIMUM_FEE_RATE = 1;
export const DUST_LIMIT = 546;
export const MAXREQUESTRATE = process.env.MAXREQUESTRATE
  ? Number(process.env.MAXREQUESTRATE)
  : DEFAULTS.MAXREQUESTRATE;

export const SATSINBTC = 100000000;
export const NETWORKID = process.env.NETWORK;
export let NETWORK =
  NETWORKID === "testnet"
    ? networks.testnet
    : NETWORKID === "regtest"
      ? networks.regtest
      : networks.bitcoin;
export const setNetwork = (network: Network) => (NETWORK = network);

export const {
  NODE_ENV,
  PORT = DEFAULTS.PORT,
  DB_HOST = DEFAULTS.DB_HOST,
  DB_PORT = DEFAULTS.DB_PORT,
  BLOCKEXPLORERURL,
  MEMPOOL_URL,
  TIMEOUTDURATION,
  LOGLEVEL_ERROR,
  LOGLEVEL_WARN,
  LOGLEVEL_HTTP,
  LOGLEVEL_INFO,
  LOGLEVEL_DEBUG,
  // SLACK_WEBHOOK_URL,
} = process.env;
export const FEE = Number(process.env.FEE || DEFAULTS.FEE);

export const { DB_AUTH, PRIVKEY, OLD_PRIVKEY, FEE_COLLECTOR_PUBKEY } =
  process.env;

export const BATCH_TIME_THRESHOLD = Number(
  process.env.BATCH_TIME_THRESHOLD || DEFAULTS.BATCH_TIME_THRESHOLD,
);
export const BATCH_EXPIRATION_TIME = Number(
  process.env.BATCH_EXPIRATION_TIME || DEFAULTS.BATCH_EXPIRATION_TIME,
);

export const SIGHASH = {
  ALL: Transaction.SIGHASH_ALL,
  SINGLE_ANYONECANPAY:
    Transaction.SIGHASH_SINGLE + Transaction.SIGHASH_ANYONECANPAY,
};

export const RESPONSE_CODES = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export const MSINS = 1000;
export const SECONDS_IN_MINUTE = 60;

// export const webhook = new IncomingWebhook(SLACK_WEBHOOK_URL || "", {
//   username: "GroupHug",
// });
