import { Psbt, networks } from 'bitcoinjs-lib'
import { expect } from 'chai'
import { batchQueue } from '../../../test/data/psbtData'
import { calculateServiceFees } from './calculateServiceFees'

describe('calculateServiceFees', () => {
  const psbts = batchQueue
    .slice(0, 10)
    .map(({ psbt }) => Psbt.fromBase64(psbt, { network: networks.regtest }))
  it('should calculate the available service fee based on utxo values', () => {
    expect(calculateServiceFees(psbts)).to.equal(1037100)
  })
})
