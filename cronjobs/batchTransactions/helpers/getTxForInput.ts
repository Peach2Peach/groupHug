import { PsbtTxInput } from 'bitcoinjs-lib'
import { getTx } from '../../../src/utils/electrs'
import { getTxIdOfInput } from '../../../src/utils/psbt'

export const getTxForInput = async (input: PsbtTxInput) => {
  const { result: tx } = await getTx(getTxIdOfInput(input))
  if (!tx) return undefined

  return tx
}
