import { strictEqual } from 'assert'
import { describe, it } from 'mocha'
import { db } from '..'

describe('sintercard', () => {
  it('should return set cardinality (number of elements) of the intersection of multiple sets', async () => {
    await db.transaction(async (client) => {
      await client.sadd('test-set', ['1', '2'])
      await client.sadd('test-set-2', ['2', '4'])
    })
    strictEqual(await db.sintercard(['test-set', 'test-set-2']), 1)
  })
})
