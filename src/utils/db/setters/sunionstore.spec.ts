import { deepStrictEqual } from 'assert'
import { describe, it } from 'mocha'
import { db } from '..'
import { sleep } from '../../system'

describe('sunionstore', () => {
  it('should store the result of a union', async () => {
    await db.transaction(async (client) => {
      await client.sadd('test-set-union-store-1', '1')
      await client.sadd('test-set-union-store-1', '2')
      await client.sadd('test-set-union-store-1', '3')
      await client.sadd('test-set-union-store-2', '3')
      await client.sadd('test-set-union-store-2', '4')
      await client.sadd('test-set-union-store-2', '5')
      await client.sunionstore('test-set-union-store-union', ['test-set-union-store-1', 'test-set-union-store-2'])
    })
    deepStrictEqual(await db.smembers('test-set-union-store-union'), ['1', '2', '3', '4', '5'])
  })
  it('should store the result of a union with expiration date', async () => {
    await db.transaction(async (client) => {
      await client.sadd('test-set-union-store-1', '1')
      await client.sadd('test-set-union-store-1', '2')
      await client.sadd('test-set-union-store-1', '3')
      await client.sadd('test-set-union-store-2', '3')
      await client.sadd('test-set-union-store-2', '4')
      await client.sadd('test-set-union-store-2', '5')
      await client.sunionstore('test-set-union-store-union', ['test-set-union-store-1', 'test-set-union-store-2'])
    })
    await db.transaction(async (client) => {
      await client.sunionstore(
        'test-set-union-store-union-expire',
        ['test-set-union-store-1', 'test-set-union-store-2'],
        50,
      )
    })
    deepStrictEqual(await db.smembers('test-set-union-store-union-expire'), ['1', '2', '3', '4', '5'])
    await sleep(52)
    deepStrictEqual(await db.smembers('test-set-union-store-union-expire'), [])
  })
})
