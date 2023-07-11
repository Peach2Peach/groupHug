import { Psbt } from 'bitcoinjs-lib'
import { FEE } from '../../../constants'

export const addPSBTOutputs = (psbt: Psbt, address: string, value: number) => {
  const fees = value * FEE
  const miningFees = 10 * 171
  const outputValue = value - fees - miningFees
  psbt.addOutput({
    address,
    value: outputValue,
  })

  return psbt
}
