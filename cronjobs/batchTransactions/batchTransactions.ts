import { Psbt } from 'bitcoinjs-lib'
import { BUCKETS, BATCH_SIZE_THRESHOLD, NETWORK } from '../../constants'
import { getFeeEstimates } from '../../src/utils/electrs'
import getLogger from '../../src/utils/logger'
import { getPSBTsFromQueue } from '../../src/utils/queue'
import { getFeeRanges } from './getFeeRanges'
import { getSteps } from './getSteps'
import { finalize, signAllInputs } from '../../src/utils/psbt'

const logger = getLogger('job', 'batchTransactions')

export const batchTransactions = async () => {
  logger.debug('Start batch process')

  const feeEstimatesResult = await getFeeEstimates()

  if (feeEstimatesResult.isError()) {
    logger.error(['Could not get fee estimates', feeEstimatesResult.getError()])
    return false
  }

  const { fastestFee } = feeEstimatesResult.getValue()
  const feeRanges = getFeeRanges(getSteps(fastestFee, BUCKETS)).reverse()
  const buckets = await Promise.all(feeRanges.map(([min, max]) => getPSBTsFromQueue(min, max)))

  // TODO add time threshold
  const readyForBatch = buckets.filter((bucket) => bucket.length >= BATCH_SIZE_THRESHOLD)

  readyForBatch.forEach((batch) => {
    const batchedTransaction = new Psbt({ network: NETWORK })
    batchedTransaction.addInputs(batch.map((tx) => ({ ...tx.txInputs[0], ...tx.data.inputs[0] })))
    batchedTransaction.addOutputs(batch.map((tx) => tx.txOutputs[0]))

    batchedTransaction.addOutput({
      address: 'getFeeAddress()', // TODO
      value: (fundingUTXO1.value + fundingUTXO2.value + fundingUTXO3.value) * FEE,
    })

    signAllInputs(batchedTransaction, signer1) // TODO

    const finalTransaction = finalize(batchedTransaction)

    // await regtestUtils.broadcast(finalTransaction.toHex())
  })
  return true
}
