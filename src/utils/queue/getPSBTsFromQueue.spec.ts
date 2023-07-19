import { expect } from 'chai'
import { psbt1, psbt2, psbt3 } from '../../../test/data/psbtData'
import { db } from '../db'
import { addPSBTToQueueWithClient } from './addPSBTToQueue'
import { getPSBTsFromQueue } from './getPSBTsFromQueue'

describe('getPSBTsFromQueue', () => {
  it('get psbts from queue between min gte and max lt', async () => {
    await db.transaction(async (client) => {
      await Promise.all([
        addPSBTToQueueWithClient(client, psbt1, 2),
        addPSBTToQueueWithClient(client, psbt2, 4),
        addPSBTToQueueWithClient(client, psbt3, 3),
      ])
    })

    expect(await getPSBTsFromQueue(2, 3)).to.deep.equal([
      { feeRate: 2, psbt: psbt1 },
    ])
    expect(await getPSBTsFromQueue(2, 4)).to.deep.equal([
      { feeRate: 2, psbt: psbt1 },
      { feeRate: 3, psbt: psbt3 },
    ])
  })
  it('get all psbts from queue', async () => {
    await db.transaction(async (client) => {
      await Promise.all([
        addPSBTToQueueWithClient(client, psbt1, 2),
        addPSBTToQueueWithClient(client, psbt2, 4),
        addPSBTToQueueWithClient(client, psbt3, 3),
      ])
    })
    const queue = await getPSBTsFromQueue()
    expect(queue).to.deep.include({ feeRate: 2, psbt: psbt1 })
    expect(queue).to.deep.include({ feeRate: 4, psbt: psbt2 })
    expect(queue).to.deep.include({ feeRate: 3, psbt: psbt3 })
  })
})
