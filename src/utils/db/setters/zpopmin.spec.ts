import { expect } from 'chai'
import { describe, it } from 'mocha'
import { db } from '..'

describe('zpopmin', () => {
  it('should pop the item with the lowest score', async () => {
    await db.transaction(async (client) => {
      await client.zadd('test-set-1', 4, '1')
      await client.zadd('test-set-1', 3, '2')
      await client.zadd('test-set-1', 5, '3')
      await client.zpopmin('test-set-1')
    })
    expect(await db.zrange('test-set-1')).to.deep.equal(['1', '3'])
  })
})
