import { Psbt } from 'bitcoinjs-lib'
import { NETWORK } from '../../constants'
import { round } from '../../src/utils/math'
import { finalize } from '../../src/utils/psbt'
import { getExtraPSBTData } from '../../src/utils/queue'
import { PSBTWithFeeRate } from '../../src/utils/queue/getPSBTsFromQueue'
import { getError, getResult } from '../../src/utils/result'
import { getUnusedFeeAddress } from '../../src/wallets'
import { getAverageFeeRate, getBatchedTransaction } from './helpers'
import { addFeeOutput } from './helpers/addFeeOutput'
import { calculateServiceFees } from './helpers/calculateServiceFees'
import { getUnspentPsbts } from './helpers/getUnspentPsbts'
import { signBatchedTransaction } from './helpers/signBatchedTransaction'

const buildBatchedTransaction = async (
  psbts: Psbt[],
  averageFeeRate: number,
  extraPSBTData: Record<string, string>[],
  miningFees: number,
) => {
  const batchedTransaction = await getBatchedTransaction(psbts, NETWORK)
  batchedTransaction.setMaximumFeeRate(round(averageFeeRate + 1))
  await addFeeOutput(batchedTransaction, await getUnusedFeeAddress(), calculateServiceFees(psbts) - miningFees)
  signBatchedTransaction(batchedTransaction, extraPSBTData)
  const finalTransaction = finalize(batchedTransaction)
  return finalTransaction
}

export const batchBucket = async (bucket: PSBTWithFeeRate[]) => {
  const { psbts } = await getUnspentPsbts(bucket.map(({ psbt }) => psbt))

  if (psbts.length === 0) return getError('No psbts left to spend')

  const averageFeeRate = getAverageFeeRate(bucket)
  const extraPSBTData = await Promise.all(psbts.map(getExtraPSBTData))
  const stagedTx = await buildBatchedTransaction(psbts, averageFeeRate, extraPSBTData, 0)
  const miningFees = stagedTx.virtualSize() * averageFeeRate
  const finalTransaction = await buildBatchedTransaction(psbts, averageFeeRate, extraPSBTData, miningFees)
  return getResult(finalTransaction)
}
