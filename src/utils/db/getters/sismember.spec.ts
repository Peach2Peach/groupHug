import { ok } from 'assert'
import { describe, it } from 'mocha'
import { db } from '..'

describe('sismember', () => {
  it('should check if a given value is a member of a set', async () => {
    await db.transaction(async (client) => {
      await Promise.all([
        client.sadd('test-set-key', '1'),
        client.sadd('test-set-key', 'a'),
        client.sadd('test-set-key', 'b'),
      ])
    })
    const [isMember1, isMemberA, isMemberB, isMemberC] = await Promise.all([
      db.sismember('test-set-key', '1'),
      db.sismember('test-set-key', 'a'),
      db.sismember('test-set-key', 'b'),
      db.sismember('test-set-key', 'c'),
    ])
    ok(isMember1)
    ok(isMemberA)
    ok(isMemberB)
    ok(!isMemberC)
  })
})
