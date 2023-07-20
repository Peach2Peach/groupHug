import { Psbt } from 'bitcoinjs-lib'
import { sum } from '../../../src/utils/math'

export const sumPSBTInputValues = (psbt: Psbt) => psbt.data.inputs.map((u) => u.witnessUtxo.value || 0).reduce(sum, 0)
