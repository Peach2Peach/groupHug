import { expect } from 'chai'
import { describe, it } from 'mocha'
import { db } from '..'

describe('zpopmin', () => {
  it('should pop the item with the lowest score', async () => {
    await db.transaction(async (client) => {
      await client.zadd('test-set-1', 4, '1')
      await client.zadd('test-set-1', 3, '2')
      await client.zadd('test-set-1', 5, '3')
    })
    expect(await db.zpopmin('test-set-1')).to.equal('2')
  })
  it('should return undefined if no item could be popped', async () => {
    await db.transaction(async (client) => {
      await client.zadd('test-set-1', 5, '3')
    })
    expect(await db.zpopmin('test-set-1')).to.equal('3')
    expect(await db.zpopmin('test-set-1')).to.equal(undefined)
    expect(await db.zpopmin('non-existing')).to.equal(undefined)
  })
})
