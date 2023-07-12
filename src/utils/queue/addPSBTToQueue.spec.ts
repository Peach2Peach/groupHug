import { expect } from 'chai'
import { psbt1 } from '../../../test/data/psbtData'
import { db } from '../db'
import { KEYS } from '../db/keys'
import { addPSBTToQueue } from './addPSBTToQueue'

describe('addPSBTToQueue', () => {
  it('stores psbt with fee rate to queue in database', async () => {
    await addPSBTToQueue(psbt1, 2)
    expect(await db.zrangewithscores(KEYS.PSBT.QUEUE)).to.deep.equal([{ score: 2, value: psbt1.toBase64() }])
  })
})
