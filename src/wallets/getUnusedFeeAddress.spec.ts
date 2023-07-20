import { expect } from 'chai'
import { getUnusedFeeAddress } from './getUnusedFeeAddress'
import { db } from '../utils/db'
import { KEYS } from '../utils/db/keys'

describe('getUnusedFeeAddress', () => {
  it('returns address of index 0 if none has been used yet', async () => {
    expect(await getUnusedFeeAddress()).to.equal(
      'bcrt1qcesq0ygge7lplef830reav07ukh6ngspc6h7pm',
    )
  })
  it('returns latest unused fee address', async () => {
    await db.transaction(async (client) => {
      await client.incr(KEYS.FEE.INDEX)
    })
    expect(await getUnusedFeeAddress()).to.equal(
      'bcrt1qupfa6jeus78n0ur28aun8fpm7aglj2a57em865',
    )
  })
})
