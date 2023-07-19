import { Psbt } from 'bitcoinjs-lib'
import { hasBucketReachedSizeThreshold } from './hasBucketReachedSizeThreshold'
import { hasBucketReachedTimeThreshold } from './hasBucketReachedTimeThreshold'

export const isBucketReadyForBatch = (bucket: Psbt[], index: number) =>
  hasBucketReachedSizeThreshold(bucket) || hasBucketReachedTimeThreshold(index)
