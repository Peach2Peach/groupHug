import { strictEqual } from 'assert'
import { networks, script } from 'bitcoinjs-lib'
import ECPairFactory from 'ecpair'
import * as ecc from 'tiny-secp256k1'
import { setNetwork } from '../../../constants'
import { getPeachEscrowScript } from '.'
import { loadESCROWFEEHD, loadPeachEscrowHD, peachEscrowHD } from './constants'
const bip68 = require('bip68')

describe('peachEscrowScript', () => {
  const escrowExpiry = 4320 // 30 days

  const ECPair = ECPairFactory(ecc)

  const seller = ECPair.fromWIF('L1Bz4WbFsLd1Rc7FvSWXeHu7Qe161dA1EswbR5YHzckwYK5nEiYp')

  const expectedScript = `
  OP_IF
    e010
    OP_CHECKSEQUENCEVERIFY
    OP_DROP
  OP_ELSE
    02e82ecc3ab700832d5ac61624078b72307c9b7d7906d4790eea868bb167808fdd
    OP_CHECKSIGVERIFY
  OP_ENDIF
  023e4e1a8eeef894ace9c3d5b9947783ea2296d8e1feef56107e69a6a4a6686e65
  OP_CHECKSIG`
    .trim()
    .replace(/\s+/gu, ' ')

  before(() => {
    setNetwork(networks.bitcoin)
    loadPeachEscrowHD(
      'xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi',
    )
    loadESCROWFEEHD(
      'xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8',
    )
  })
  it('returns the script for a given seller and peach pk as well as typical escrow expiry', () => {
    const peachEscrow = peachEscrowHD.derivePath('m/48\'/0\'/0\'/20210\'')
    const escrowScript = getPeachEscrowScript(
      seller.publicKey,
      peachEscrow.publicKey,
      bip68.encode({ blocks: escrowExpiry }),
    )
    strictEqual(script.toASM(escrowScript), expectedScript)
  })
})
