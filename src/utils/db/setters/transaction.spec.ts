import { strictEqual } from 'assert'
import { describe, it } from 'mocha'
import { db } from '..'

describe('transaction', () => {
  it('should update multiple values', async () => {
    await db.transaction(async (client) => {
      await client.set('test-key', 'test-val')
      await client.set('test-key-2', 'test-val-2')
    })

    strictEqual(await db.get('test-key'), 'test-val')
    strictEqual(await db.get('test-key-2'), 'test-val-2')
  })
  it('should discard transaction if returned false', async () => {
    await db.transaction(async (client) => {
      await client.set('test-key', 'test-val')
      await client.set('test-key-2', 'test-val-2')
      return false
    })

    strictEqual(await db.get('test-key'), null)
    strictEqual(await db.get('test-key-2'), null)
  })
})
