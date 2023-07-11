import { deepStrictEqual } from 'assert'
import { describe, it } from 'mocha'
import { db } from '..'

describe('sunion', () => {
  it('should return intersection of different sets', async () => {
    await db.transaction(async (client) => {
      await client.sadd('test-set-union-1', '1')
      await client.sadd('test-set-union-1', '2')
      await client.sadd('test-set-union-1', '3')
      await client.sadd('test-set-union-2', '3')
      await client.sadd('test-set-union-2', '4')
      await client.sadd('test-set-union-2', '5')
    })
    deepStrictEqual(await db.sunion(['test-set-union-1', 'test-set-union-2']), ['1', '2', '3', '4', '5'])
  })
})
