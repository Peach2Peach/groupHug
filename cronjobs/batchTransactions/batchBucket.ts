import { NETWORK } from '../../constants'
import { finalize } from '../../src/utils/psbt'
import { getExtraPSBTData } from '../../src/utils/queue'
import { PSBTWithFeeRate } from '../../src/utils/queue/getPSBTsFromQueue'
import { getUnusedFeeAddress } from '../../src/wallets'
import { getAverageFeeRate, getBatchedTransaction } from './helpers'
import { getUnspentPsbts } from './helpers/getUnspentPsbts'
import { calculateServiceFees } from './helpers/calculateServiceFees'
import { addFeeOutput } from './helpers/addFeeOutput'
import { signBatchedTransaction } from './helpers/signBatchedTransaction'
import { Psbt } from 'bitcoinjs-lib'

const buildBatchedTransaction = async (
  psbts: Psbt[],
  averageFeeRate: number,
  extraPSBTData: Record<string, string>[],
  miningFees: number,
) => {
  const batchedTransaction = await getBatchedTransaction(psbts, NETWORK)
  batchedTransaction.setMaximumFeeRate(averageFeeRate + 1)
  await addFeeOutput(batchedTransaction, await getUnusedFeeAddress(), calculateServiceFees(psbts) - miningFees)
  signBatchedTransaction(batchedTransaction, extraPSBTData)
  const finalTransaction = finalize(batchedTransaction)
  return finalTransaction
}

export const batchBucket = async (bucket: PSBTWithFeeRate[]) => {
  const { psbts } = await getUnspentPsbts(bucket.map(({ psbt }) => psbt))
  const averageFeeRate = getAverageFeeRate(bucket)
  const extraPSBTData = await Promise.all(psbts.map(getExtraPSBTData))
  const stagedTx = await buildBatchedTransaction(psbts, averageFeeRate, extraPSBTData, 0)
  const miningFees = stagedTx.virtualSize() * averageFeeRate
  const finalTransaction = await buildBatchedTransaction(psbts, averageFeeRate, extraPSBTData, miningFees)
  return finalTransaction
}
