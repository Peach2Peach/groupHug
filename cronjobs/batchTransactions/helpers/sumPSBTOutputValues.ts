import { Psbt } from 'bitcoinjs-lib'
import { sum } from '../../../src/utils/math'

export const sumPSBTOutputValues = (psbt: Psbt) => psbt.txOutputs.map((u) => u.value).reduce(sum, 0)
