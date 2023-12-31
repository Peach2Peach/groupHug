import { expect } from 'chai'
import { psbt1 } from '../../../test/data/psbtData'
import { db } from '../db'
import { addPSBTToBatchWithClient } from './addPSBTToBatch'
import { deleteBatch } from './deleteBatch'
import { getPSBTsFromBatch } from './getPSBTsFromBatch'
import { networks } from 'bitcoinjs-lib'

describe('deleteBatch', () => {
  const txId = 'txId'
  it('get psbts from batch', async () => {
    await db.transaction(async (client) => {
      await addPSBTToBatchWithClient(client, txId, psbt1, 2)
    })
    await deleteBatch(txId)
    expect(await getPSBTsFromBatch(txId, networks.regtest)).to.deep.equal([])
  })
})
