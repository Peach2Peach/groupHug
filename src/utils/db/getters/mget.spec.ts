import { ok } from 'assert'
import { describe, it } from 'mocha'
import { db } from '..'

describe('mget', () => {
  it('should get many values from database', async () => {
    await db.transaction(async (client) => {
      await client.set('test-key', 'test-val')
      await client.incr('incr-test')
      await client.incr('incr-test')
    })
    const entry = await db.mget(['test-key', 'incr-test'])

    ok(entry.indexOf('test-val') !== -1)
    ok(entry.indexOf('2') !== -1)
  })
})
