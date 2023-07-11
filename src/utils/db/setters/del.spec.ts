import { strictEqual } from 'assert'
import { describe, it } from 'mocha'
import { db } from '..'

describe('del', () => {
  it('should delete a value from database', async () => {
    await db.transaction(async (client) => {
      await client.del('test-key')
      await client.del('test-hm-key')
    })

    strictEqual(await db.get('test-key'), null)
    strictEqual(await db.get('test-hm-key'), null)
  })
})
