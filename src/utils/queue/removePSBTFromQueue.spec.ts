import { expect } from 'chai'
import { db } from '../db'
import { addPSBTToQueue } from './addPSBTToQueue'
import { psbt1 } from '../../../test/data/psbtData'
import { KEYS } from '../db/keys'
import { removePSBTFromQueue } from './removePSBTFromQueue'

describe('removePSBTFromQueue', () => {
  it('stores psbt with fee rate to queue in database', async () => {
    await addPSBTToQueue(psbt1, 2)
    await removePSBTFromQueue(psbt1)
    expect(await db.zrange(KEYS.PSBT.QUEUE)).to.deep.equal([])
  })
})
