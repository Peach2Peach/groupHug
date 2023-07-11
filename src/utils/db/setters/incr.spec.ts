import { strictEqual } from 'assert'
import { describe, it } from 'mocha'
import { db } from '..'

describe('incr', () => {
  it('should set a value to database', async () => {
    await db.transaction(async (client) => {
      await client.incr('incr-test')
      await client.incr('incr-test')
    })

    strictEqual(await db.get('incr-test'), '2')
  })
})
