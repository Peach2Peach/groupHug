import { deepStrictEqual, ok } from 'assert'
import { describe, it } from 'mocha'
import { db } from '..'

describe('sadd', () => {
  it('should add a member to a set', async () => {
    await db.transaction(async (client) => {
      await client.sadd('test-set-key', '1')
    })

    deepStrictEqual(await db.smembers('test-set-key'), ['1'])

    await db.transaction(async (client) => {
      await client.sadd('test-set-key', 'a')
      await client.sadd('test-set-key', 'b')
    })

    const entry = await db.smembers('test-set-key')
    ok(entry.length === 3)
    ok(entry.indexOf('1') !== -1)
    ok(entry.indexOf('a') !== -1)
    ok(entry.indexOf('b') !== -1)
  })
  it('should add multiple members to a set', async () => {
    const members = ['1', '2']
    await db.transaction(async (client) => {
      await client.sadd('test-set-key', members)
    })

    deepStrictEqual(await db.smembers('test-set-key'), members)
  })
})
