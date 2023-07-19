import { PSBTWithFeeRate } from '../../../src/utils/queue/getPSBTsFromQueue'
import { hasBucketReachedSizeThreshold } from './hasBucketReachedSizeThreshold'
import { hasBucketReachedTimeThreshold } from './hasBucketReachedTimeThreshold'

export const isBucketReadyForBatch = (bucket: PSBTWithFeeRate[], index: number) =>
  hasBucketReachedSizeThreshold(bucket.map(({ psbt }) => psbt)) || hasBucketReachedTimeThreshold(index)
