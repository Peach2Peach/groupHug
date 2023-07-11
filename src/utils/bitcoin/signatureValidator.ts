import { ECPairFactory } from 'ecpair'
import * as ecc from 'tiny-secp256k1'
import { NETWORK } from '../../../constants'

const network = NETWORK
const ECPair = ECPairFactory(ecc)

export const signatureValidator = (publicKey: Buffer, msgHash: Buffer, signature: Buffer) => {
  try {
    const keyPair = ECPair.fromPublicKey(publicKey, { network })
    return keyPair.verify(msgHash, signature)
  } catch (e) {
    return false
  }
}
