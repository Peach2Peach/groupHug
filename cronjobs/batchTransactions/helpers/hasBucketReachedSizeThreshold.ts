import { Psbt } from 'bitcoinjs-lib'
import { BATCH_SIZE_THRESHOLD } from '../../../constants'

export const hasBucketReachedSizeThreshold = (bucket: Psbt[]) => bucket.length >= BATCH_SIZE_THRESHOLD
