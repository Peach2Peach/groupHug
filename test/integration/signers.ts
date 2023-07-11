import { networks, payments } from 'bitcoinjs-lib'
import { ECPairFactory } from 'ecpair'
import * as ecc from 'tiny-secp256k1'
const ECPair = ECPairFactory(ecc)
const { regtest } = networks

export const buyer = ECPair.fromWIF('cScfkGjbzzoeewVWmU2hYPUHeVGJRDdFt7WhmrVVGkxpmPP8BHWe', regtest)
export const buyerAddress = payments.p2wpkh({
  pubkey: buyer.publicKey,
  network: regtest,
}).address

export const seller = ECPair.fromWIF('cMkopUXKWsEzAjfa1zApksGRwjVpJRB3831qM9W4gKZsLwjHXA9x', regtest)
