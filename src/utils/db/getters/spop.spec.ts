import { expect } from 'chai'
import { describe, it } from 'mocha'
import { db } from '..'

describe('spop', () => {
  it('should pop last value from set', async () => {
    await db.transaction(async (client) => {
      await client.sadd('test-set', '1')
    })
    expect(await db.spop('test-set')).to.deep.equal(['1'])
  })
})
