import { strictEqual } from 'assert'
import { describe, it } from 'mocha'
import { db } from '..'
import { sleep } from '../../system'

describe('set', () => {
  it('should set a value to database', async () => {
    await db.transaction(async (client) => {
      await client.set('test-key', 'test-val')
    })

    strictEqual(await db.get('test-key'), 'test-val')
  })

  it('should set a value to database with expiration date', async () => {
    await db.transaction(async (client) => {
      await client.set('expiring-key', 'expiring-val', 30)
    })

    strictEqual(await db.get('expiring-key'), 'expiring-val')
    await sleep(33)
    strictEqual(await db.get('expiring-key'), null)
  })
})
