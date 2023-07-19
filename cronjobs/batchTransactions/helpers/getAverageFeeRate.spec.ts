import { Psbt } from 'bitcoinjs-lib'
import { expect } from 'chai'
import { batchQueue } from '../../../test/data/psbtData'
import { getAverageFeeRate } from './getAverageFeeRate'

describe('getAverageFeeRate', () => {
  const psbts = batchQueue.map(({ feeRate, psbt }) => ({
    feeRate,
    psbt: Psbt.fromBase64(psbt),
  }))

  it('should calculate average fee rate of bucket', () => {
    expect(getAverageFeeRate(psbts.slice(80, 100))).to.equal(28)
    expect(getAverageFeeRate(psbts.slice(68, 80))).to.equal(22)
    expect(getAverageFeeRate(psbts.slice(61, 68))).to.equal(20)
    expect(getAverageFeeRate(psbts.slice(58, 61))).to.equal(18)
    expect(getAverageFeeRate(psbts.slice(51, 58))).to.equal(16)
    expect(getAverageFeeRate(psbts.slice(48, 51))).to.equal(13)
    expect(getAverageFeeRate(psbts.slice(45, 48))).to.equal(11)
    expect(getAverageFeeRate(psbts.slice(33, 45))).to.equal(8)
    expect(getAverageFeeRate(psbts.slice(19, 33))).to.equal(6)
    expect(getAverageFeeRate(psbts.slice(9, 19))).to.equal(4)
    expect(getAverageFeeRate(psbts.slice(0, 9))).to.equal(2)
  })
})
