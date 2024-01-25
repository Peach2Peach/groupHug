import { PSBTWithFeeRate } from '../../../src/utils/queue/getPSBTsFromQueue'
import { hasBucketReachedSizeThreshold } from './hasBucketReachedSizeThreshold'

export const isBucketReadyForBatch = (bucket: PSBTWithFeeRate[]) =>
  hasBucketReachedSizeThreshold(bucket.map(({ psbt }) => psbt))
