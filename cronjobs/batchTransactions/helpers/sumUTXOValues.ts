import { sum } from '../../../src/utils/math'

export const sumUTXOValues = (utxo: UTXO[]) => utxo.map((u) => u.value).reduce(sum, 0)
