import { ok } from 'assert'
import { describe, it } from 'mocha'
import { db } from '..'

describe('sismember', () => {
  it('should check if a given value is a member of a set', async () => {
    await db.transaction(async (client) => {
      await client.sadd('test-set-key', '1')
      await client.sadd('test-set-key', 'a')
      await client.sadd('test-set-key', 'b')
    })
    ok(await db.sismember('test-set-key', '1'))
    ok(await db.sismember('test-set-key', 'a'))
    ok(await db.sismember('test-set-key', 'b'))
    ok(!(await db.sismember('test-set-key', 'c')))
  })
})
