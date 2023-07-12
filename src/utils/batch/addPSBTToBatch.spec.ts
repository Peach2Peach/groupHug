import { expect } from 'chai'
import { db } from '../db'
import { addPSBTToBatch } from './addPSBTToBatch'
import { psbt1 } from '../../../test/data/psbtData'
import { KEYS } from '../db/keys'

describe('addPSBTToBatch', () => {
  it('stores psbt with fee rate to batch in database', async () => {
    const txId = 'txId'
    await addPSBTToBatch(txId, psbt1, 2)
    expect(await db.zrangewithscores(KEYS.BATCH + txId)).to.deep.equal([{ score: 2, value: psbt1.toBase64() }])
  })
})
