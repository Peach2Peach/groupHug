import { PsbtTxInput } from 'bitcoinjs-lib'
import { getTx } from '../../../src/utils/electrs'

export const getTxForInput = async (input: PsbtTxInput) => {
  const { result: tx } = await getTx(input.hash.toString('hex'))
  if (!tx) return undefined

  return tx
}
