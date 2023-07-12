import { expect } from 'chai'
import { describe, it } from 'mocha'
import { db } from '..'

describe('hget', () => {
  it('should get value by key of hash', async () => {
    await db.transaction(async (client) => {
      await client.hset('test-hm-key', {
        a: 1,
      })
    })
    const result = await db.transaction(async (client) => {
      const value = await client.hget('test-hm-key', 'a')
      return value === '1'
    })
    expect(result.isOk()).to.be.true
  })
})
