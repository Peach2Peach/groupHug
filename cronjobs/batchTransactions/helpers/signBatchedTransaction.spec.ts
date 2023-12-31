import { Psbt, networks } from 'bitcoinjs-lib'
import { expect } from 'chai'
import { batchQueue } from '../../../test/data/psbtData'
import { signBatchedTransaction } from './signBatchedTransaction'

describe('signBatchedTransaction', () => {
  it('signs the batched transaction', () => {
    const psbt = Psbt.fromBase64(batchQueue[0].psbt, {
      network: networks.regtest,
    })
    signBatchedTransaction(psbt, [
      {
        index: batchQueue[0].index,
        psbt: 'psbt',
        revocationToken: 'revocationToken',
      },
    ])
    expect(psbt.data.inputs[0].partialSig.length).to.equal(2)
  })
  it('does not sign if no index is passed', () => {
    const psbt = Psbt.fromBase64(batchQueue[0].psbt, {
      network: networks.regtest,
    })
    signBatchedTransaction(psbt, [
      { psbt: 'psbt', revocationToken: 'revocationToken' },
    ])
    expect(psbt.data.inputs[0].partialSig.length).to.equal(1)
  })
  it('does not sign if no the signer is not part of the multisig', () => {
    const psbt = Psbt.fromBase64(batchQueue[0].psbt, {
      network: networks.regtest,
    })
    signBatchedTransaction(psbt, [
      { index: 123, psbt: 'psbt', revocationToken: 'revocationToken' },
    ])
    expect(psbt.data.inputs[0].partialSig.length).to.equal(1)
  })
})
