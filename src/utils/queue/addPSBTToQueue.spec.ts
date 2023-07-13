import { expect } from 'chai'
import { psbt1 } from '../../../test/data/psbtData'
import { db } from '../db'
import { KEYS } from '../db/keys'
import { addPSBTToQueue } from './addPSBTToQueue'

describe('addPSBTToQueue', () => {
  it('stores psbt with fee rate to queue in database', async () => {
    const result = await addPSBTToQueue(psbt1, 2)
    const { id, revocationToken } = result.getResult()
    expect(await db.zrangewithscores(KEYS.PSBT.QUEUE)).to.deep.equal([
      { score: 2, value: psbt1.toBase64() },
    ])
    expect(await db.hgetall(KEYS.PSBT.PREFIX + id)).to.deep.equal({
      psbt: psbt1.toBase64(),
      revocationToken,
    })
  })
})
