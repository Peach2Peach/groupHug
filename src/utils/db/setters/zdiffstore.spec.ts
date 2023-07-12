import { expect } from 'chai'
import { describe, it } from 'mocha'
import { db } from '..'

describe('zdiffstore', () => {
  beforeEach(async () => {
    await db.transaction(async (client) => {
      await Promise.all([
        client.zadd('test-set-1', 1, '1'),
        client.zadd('test-set-1', 2, '2'),
        client.zadd('test-set-1', 3, '3'),
        client.zadd('test-set-2', 4, '3'),
        client.zadd('test-set-2', 5, '2'),
      ])
    })
  })
  it('should store difference of sorted sets', async () => {
    await db.transaction(async (client) => {
      await client.zdiffstore('test-set-diff', 'test-set-1', 'test-set-2')
    })
    expect(await db.zrange('test-set-diff')).to.deep.equal(['1'])
  })
})
