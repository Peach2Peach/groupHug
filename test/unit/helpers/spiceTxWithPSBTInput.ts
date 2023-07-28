import { PsbtTxInput } from 'bitcoinjs-lib'
import blockExplorerData from '../../data/blockExplorerData.json'
import { getTxIdOfInput } from '../../../src/utils/psbt'

export const spiceTxWithPSBTInput = (input: PsbtTxInput): Transaction => ({
  ...blockExplorerData.tx,
  txid: getTxIdOfInput(input),
})
