import { strictEqual } from 'assert'
import { describe, it } from 'mocha'
import { db } from '..'

describe('incr', () => {
  it('should set a value to database', async () => {
    await db.transaction(async (client) => {
      await Promise.all([client.incr('incr-test'), client.incr('incr-test')])
    })

    strictEqual(await db.get('incr-test'), '2')
  })
})
