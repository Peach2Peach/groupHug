import { expect } from 'chai'
import { describe, it } from 'mocha'
import { db } from '..'

describe('hincrby', () => {
  it('should increase a subkey of type number of hash set', async () => {
    await db.transaction(async (client) => {
      await client.hset('test-hm-key', {
        a: 1,
      })
      await client.hincrby('test-hm-key', 'a', 3)
    })
    expect(await db.hmget('test-hm-key', 'a')).to.deep.equal(['4'])
  })
  it('should increase a subkey of type number of hash set by 1 (default)', async () => {
    await db.transaction(async (client) => {
      await client.hset('test-hm-key', {
        a: 1,
      })
      await client.hincrby('test-hm-key', 'a')
    })
    expect(await db.hmget('test-hm-key', 'a')).to.deep.equal(['2'])
  })
})
