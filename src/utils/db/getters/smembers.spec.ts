import { ok } from 'assert'
import { describe, it } from 'mocha'
import { db } from '..'

describe('smembers', () => {
  it('should return an empty array for empty sets', async () => {
    await db.transaction(async (client) => {
      await client.srem('test-set-key', 'a')
    })

    const entry = await db.smembers('test-set-key')
    ok(entry.length === 0)
  })

  it('should return an empty array for non existing sets', async () => {
    const entry = await db.smembers('test-non-existent-set-key')
    ok(entry.length === 0)
  })
})
