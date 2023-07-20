import { Psbt, networks } from 'bitcoinjs-lib'
import { expect } from 'chai'
import { batchQueue } from '../../../test/data/psbtData'
import { addFeeOutput } from './addFeeOutput'

describe('addFeeOutput', () => {
  const psbt = Psbt.fromBase64(batchQueue[0].psbt, {
    network: networks.regtest,
  })
  const address = 'bcrt1qcesq0ygge7lplef830reav07ukh6ngspc6h7pm'
  const value = 10000
  it('adds the fee output to the psbt', () => {
    addFeeOutput(psbt, address, value)
    const feeOutput = psbt.txOutputs[psbt.txOutputs.length - 1]
    expect(feeOutput.address).to.equal(address)
    expect(feeOutput.value).to.equal(value)
  })
})
