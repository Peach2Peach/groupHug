import { script } from 'bitcoinjs-lib'

export const getPeachEscrowScript = (sellerPK: Buffer, peachPK: Buffer, _sequence: number): Buffer =>
  script.fromASM(
    `
   OP_IF
       ${script.number.encode(_sequence).toString('hex')}
       OP_CHECKSEQUENCEVERIFY
       OP_DROP
   OP_ELSE
       ${sellerPK.toString('hex')}
       OP_CHECKSIGVERIFY
   OP_ENDIF
   ${peachPK.toString('hex')}
   OP_CHECKSIG
 `
      .trim()
      .replace(/\s+/gu, ' '),
  )
