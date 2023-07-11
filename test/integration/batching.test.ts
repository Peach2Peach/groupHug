import { networks, payments, Psbt } from 'bitcoinjs-lib'
import { expect } from 'chai'
import { before, describe, it } from 'mocha'
import { FEE, feeWallet, hotWallet, loadFeeWallet, loadHotWallet, NETWORK, setNetwork, SIGHASH } from '../../constants'
import { isTestnet, signatureValidator } from '../../src/utils/bitcoin'
import { regtestUtils } from './_regtest'
import { psbt1, psbt2, psbt3 } from './psbt'
import { buyerAddress, seller } from './signers'
import { getMultisigScript } from './helpers/getMultisigScript'
import { getFinalScript } from './helpers/getFinalScript'
import { getAddressFromScript } from './helpers/getAddressFromScript'
import { buildPSBT } from './helpers/buildPSBT'

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

describe('peach multisig escrow address', () => {
  before(async () => {
    setNetwork(networks.regtest)
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
    const escrowScript1 = getMultisigScript(seller.publicKey, signer1.publicKey)
    const escrowScript2 = getMultisigScript(seller.publicKey, signer2.publicKey)
    const escrowScript3 = getMultisigScript(seller.publicKey, signer3.publicKey)
    const fundingUTXO1 = await regtestUtils.faucet(getAddressFromScript(escrowScript1), 100000)
    const fundingUTXO2 = await regtestUtils.faucet(getAddressFromScript(escrowScript2), 200000)
    const fundingUTXO3 = await regtestUtils.faucet(getAddressFromScript(escrowScript3), 300000)
    const transaction1 = buildPSBT(escrowScript1, fundingUTXO1, buyerAddress)
    const transaction2 = buildPSBT(escrowScript2, fundingUTXO2, buyerAddress)
    const transaction3 = buildPSBT(escrowScript3, fundingUTXO3, buyerAddress)

    ;[transaction1, transaction2, transaction3].forEach((tx) =>
      tx.txInputs.forEach((input, i) => {
        tx.updateInput(i, { sighashType: SIGHASH.SINGLE_ANYONECANPAY })
        tx.signInput(i, seller, [SIGHASH.SINGLE_ANYONECANPAY])
      }),
    )

    const batchedTransaction = new Psbt({ network: networks.regtest })
    const txs = [transaction1, transaction2, transaction3]
    batchedTransaction.addInputs(txs.map((tx) => ({ ...tx.txInputs[0], ...tx.data.inputs[0] })))
    batchedTransaction.addOutputs(txs.map((tx) => tx.txOutputs[0]))

    batchedTransaction.addOutput({
      address: getFeeAddress(),
      value: (fundingUTXO1.value + fundingUTXO2.value + fundingUTXO3.value) * FEE,
    })

    expect(batchedTransaction.txOutputs.length).to.equal(4)

    batchedTransaction.txInputs.forEach((input, i) => {
      batchedTransaction.updateInput(i, { sighashType: SIGHASH.ALL })
      ;[signer1, signer2, signer3].forEach((signer) => {
        if (!batchedTransaction.data.inputs[i].witnessScript.includes(signer.publicKey)) return
        batchedTransaction.signInput(i, signer, [SIGHASH.ALL])
      })
    })

    const finalTransaction = finalize(batchedTransaction)

    await regtestUtils.broadcast(finalTransaction.toHex())

    const txId = finalTransaction.getId()

    await regtestUtils.verify({
      txId,
      address: buyerAddress,
      vout: 0,
      value: 96290,
    })
    await regtestUtils.verify({
      txId,
      address: buyerAddress,
      vout: 1,
      value: 194290,
    })
    await regtestUtils.verify({
      txId,
      address: buyerAddress,
      vout: 2,
      value: 292290,
    })
    await regtestUtils.verify({
      txId,
      address: 'bcrt1qcesq0ygge7lplef830reav07ukh6ngspc6h7pm',
      vout: 3,
      value: 12000,
    })
  })
})
