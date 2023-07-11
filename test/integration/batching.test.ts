/* eslint-disable max-statements */
/* eslint-disable max-len */
/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
import { crypto, networks, payments, Psbt, Transaction } from 'bitcoinjs-lib'
import { ECPairFactory } from 'ecpair'
import { before, describe, it } from 'mocha'
import * as ecc from 'tiny-secp256k1'
import { FEE, feeWallet, hotWallet, loadFeeWallet, loadHotWallet, NETWORK, setNetwork } from '../../constants'
import { getFinalScript, getPeachEscrowScript, isTestnet, signatureValidator } from '../../src/utils/bitcoin'
import { regtestUtils, Unspent } from './_regtest'
import { psbt1, psbt2, psbt3 } from './psbt'
import { expect } from 'chai'
const bip68 = require('bip68')

const ECPair = ECPairFactory(ecc)
const { regtest } = networks

const buyer = ECPair.fromWIF('cScfkGjbzzoeewVWmU2hYPUHeVGJRDdFt7WhmrVVGkxpmPP8BHWe', regtest)
const buyerAddress = payments.p2wpkh({
  pubkey: buyer.publicKey,
  network: regtest,
}).address

const seller = ECPair.fromWIF('cMkopUXKWsEzAjfa1zApksGRwjVpJRB3831qM9W4gKZsLwjHXA9x', regtest)

export const getDerivationPathByIndex = (index: number) => `m/48'/${isTestnet(NETWORK) ? '1' : '0'}'/0'/${index}'`

export const finalize = (psbt: Psbt) => {
  if (psbt.validateSignaturesOfAllInputs(signatureValidator)) {
    psbt.txInputs.forEach((input, i) => psbt.finalizeInput(i, getFinalScript))
    return psbt.extractTransaction()
  }
  throw Error('Signatures invalid for transaction')
}

export const getFeeAddress = () => {
  // TODO make dynamic
  const feeCollector = feeWallet.derivePath('0/0')

  return payments.p2wpkh({
    pubkey: feeCollector.publicKey,
    network: NETWORK,
  }).address
}

export const getAddressFromScript = (script: Buffer) => {
  const p2wsh = payments.p2wsh({
    network: regtest,
    redeem: {
      output: script,
      network: NETWORK,
    },
  })
  return p2wsh.address
}

export const addPSBTOutputs = (psbt: Psbt, address: string, value: number) => {
  const fees = value * FEE
  const miningFees = 6 * 171
  const outputValue = value - fees - miningFees
  psbt.addOutput({
    address,
    value: outputValue,
  })

  return psbt
}

export const buildPSBT = (script: Buffer, fundingTx: Unspent, address: string) => {
  const psbt = new Psbt({ network: regtest })
  const p2wsh = payments.p2wsh({
    network: regtest,
    redeem: {
      output: script,
      network: NETWORK,
    },
  })

  psbt.addInput({
    hash: fundingTx.txId,
    index: fundingTx.vout,
    sighashType: Transaction.SIGHASH_SINGLE,
    witnessScript: p2wsh.redeem!.output!,
    witnessUtxo: {
      script: Buffer.from('0020' + crypto.sha256(p2wsh.redeem!.output!).toString('hex'), 'hex'),
      value: fundingTx.value,
    },
  })

  return addPSBTOutputs(psbt, address, fundingTx.value)
}

describe('peach multisig escrow address', () => {
  const expiry = 10
  const sequence = bip68.encode({ blocks: expiry })

  // force update MTP
  before(async () => {
    setNetwork(regtest)
    loadFeeWallet(
      'tpubD6NzVbkrYhZ4YHw9d7jrVuwEf2HYPsvxkx369fvg8DU81tt1niPDTjcbUQgWR125iUm13Y6ua6povYR2d18XPxFbg5PFUhse4LC9hpPGpGM',
    )
    loadHotWallet(
      'tprv8ZgxMBicQKsPewi89No5MroZXrGGetMGxWJv74Yng1rrEkU7d8ahfX2YvadTjqfTpxBuVrfqzwHmoY4B7URDVVvPjN3mj8zwvzSq5Nu6Z3e',
    )

    await regtestUtils.mine(11)
  })

  it('Can combine psbts', async () => {
    const signer1 = hotWallet.derivePath(getDerivationPathByIndex(psbt1.index))
    const signer2 = hotWallet.derivePath(getDerivationPathByIndex(psbt2.index))
    const signer3 = hotWallet.derivePath(getDerivationPathByIndex(psbt3.index))
    const escrowScript1 = getPeachEscrowScript(seller.publicKey, signer1.publicKey, sequence)
    const escrowScript2 = getPeachEscrowScript(seller.publicKey, signer2.publicKey, sequence)
    const escrowScript3 = getPeachEscrowScript(seller.publicKey, signer3.publicKey, sequence)
    const fundingUTXO1 = await regtestUtils.faucet(getAddressFromScript(escrowScript1), 100000)
    const fundingUTXO2 = await regtestUtils.faucet(getAddressFromScript(escrowScript2), 200000)
    const fundingUTXO3 = await regtestUtils.faucet(getAddressFromScript(escrowScript3), 300000)
    const transaction1 = buildPSBT(escrowScript1, fundingUTXO1, buyerAddress)
    const transaction2 = buildPSBT(escrowScript2, fundingUTXO2, buyerAddress)
    const transaction3 = buildPSBT(escrowScript3, fundingUTXO3, buyerAddress)

    ;[transaction1, transaction2, transaction3].forEach((tx) =>
      tx.txInputs.forEach((input, i) => {
        tx.updateInput(i, { sighashType: 0x83 })
        tx.signInput(i, seller, [0x83])
      }),
    )

    const batchedTransaction = new Psbt({ network: regtest })
    const txs = [transaction1, transaction2, transaction3]
    batchedTransaction.addInputs(txs.map((tx) => ({ ...tx.txInputs[0], ...tx.data.inputs[0] })))
    batchedTransaction.addOutputs(txs.map((tx) => tx.txOutputs[0]))

    batchedTransaction.addOutput({
      address: getFeeAddress(),
      value: (fundingUTXO1.value + fundingUTXO2.value + fundingUTXO3.value) * FEE,
    })

    expect(batchedTransaction.txOutputs.length).to.equal(4)

    batchedTransaction.txInputs.forEach((input, i) => {
      batchedTransaction.updateInput(i, { sighashType: Transaction.SIGHASH_ALL })
      ;[signer1, signer2, signer3].forEach((signer) => {
        if (!batchedTransaction.data.inputs[i].witnessScript.includes(signer.publicKey)) return
        batchedTransaction.signInput(i, signer, [Transaction.SIGHASH_ALL])
      })
    })

    const finalTransaction = finalize(batchedTransaction)

    console.log(finalTransaction.toHex())
    await regtestUtils.broadcast(finalTransaction.toHex())

    const txId = finalTransaction.getId()

    await regtestUtils.verify({
      txId,
      address: buyerAddress,
      vout: 0,
      value: 96974,
    })
    await regtestUtils.verify({
      txId,
      address: buyerAddress,
      vout: 1,
      value: 194974,
    })
    await regtestUtils.verify({
      txId,
      address: buyerAddress,
      vout: 2,
      value: 292974,
    })
    await regtestUtils.verify({
      txId,
      address: 'bcrt1qcesq0ygge7lplef830reav07ukh6ngspc6h7pm',
      vout: 3,
      value: 12000,
    })
  })
})
