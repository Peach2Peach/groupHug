import { crypto, networks, payments, Psbt } from 'bitcoinjs-lib'
import { Unspent } from '../_regtest'
import { addPSBTOutputs } from './addPSBTOutputs'

export const buildPSBT = (script: Buffer, fundingTx: Unspent, address: string) => {
  const psbt = new Psbt({ network: networks.regtest })
  const p2wsh = payments.p2wsh({
    network: networks.regtest,
    redeem: {
      output: script,
      network: networks.regtest,
    },
  })

  psbt.addInput({
    hash: fundingTx.txId,
    index: fundingTx.vout,
    witnessScript: p2wsh.redeem!.output!,
    witnessUtxo: {
      script: Buffer.from('0020' + crypto.sha256(p2wsh.redeem!.output!).toString('hex'), 'hex'),
      value: fundingTx.value,
    },
  })

  return addPSBTOutputs(psbt, address, fundingTx.value)
}
