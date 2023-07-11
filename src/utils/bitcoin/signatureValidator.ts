import { ECPairFactory } from 'ecpair'
import * as ecc from 'tiny-secp256k1'
import { NETWORK } from '../../../constants'

const network = NETWORK
const ECPair = ECPairFactory(ecc)

export const signatureValidator = (publicKey: Buffer, msgHash: Buffer, signature: Buffer) => {
  const keyPair = ECPair.fromPublicKey(publicKey, { network })
  console.log(publicKey.toString('hex'), keyPair.verify(msgHash, signature))
  return keyPair.verify(msgHash, signature)
}
