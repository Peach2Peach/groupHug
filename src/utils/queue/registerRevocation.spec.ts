import { expect } from 'chai'
import { psbt1 } from '../../../test/data/psbtData'
import { db } from '../db'
import { KEYS } from '../db/keys'
import { registerRevocation } from './registerRevocation'

describe('removePSBTFromQueue', () => {
  it('stores psbt with fee rate to queue in database', async () => {
    const result = await registerRevocation(psbt1)
    const { id, revocationToken } = result.getResult()
    expect(await db.hgetall(KEYS.PSBT.PREFIX + id)).to.deep.equal({
      psbt: psbt1.toBase64(),
      revocationToken,
    })
  })
})
