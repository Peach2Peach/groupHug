import { expect } from 'chai'
import { psbt1 } from '../../../test/data/psbtData'
import { db } from '../db'
import { KEYS } from '../db/keys'
import { addPSBTToQueue, getExtraPSBTDataById } from '../queue'
import { addPSBTToBatch } from './addPSBTToBatch'

describe('addPSBTToBatch', () => {
  it('stores psbt with fee rate to batch in database', async () => {
    const txId = 'txId'
    const result = await addPSBTToQueue(psbt1, 2)
    await addPSBTToBatch(txId, psbt1, 2)
    expect(await db.zrangewithscores(KEYS.BATCH + txId)).to.deep.equal([
      { score: 2, value: psbt1.toBase64() },
    ])
    expect(await getExtraPSBTDataById(result.getResult().id)).to.deep.equal({
      index: undefined,
      psbt: psbt1.toBase64(),
      revocationToken: result.getResult().revocationToken,
      txId,
    })
  })
})
