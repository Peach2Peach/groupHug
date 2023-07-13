import { expect } from 'chai'
import { psbt1 } from '../../../test/data/psbtData'
import { db } from '../db'
import { KEYS } from '../db/keys'
import { registerPSBT } from './registerPSBT'

describe('registerPSBT', () => {
  it('stores psbt data', async () => {
    const result = await registerPSBT(psbt1)
    const { id, revocationToken } = result.getResult()
    expect(await db.hgetall(KEYS.PSBT.PREFIX + id)).to.deep.equal({
      psbt: psbt1.toBase64(),
      revocationToken,
    })
  })
})
