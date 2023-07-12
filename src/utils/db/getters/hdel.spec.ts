import { expect } from 'chai'
import { describe, it } from 'mocha'
import { db } from '..'
import { complexVal } from '../../../../test/data/primitiveData'

describe('hdel', () => {
  it('should delete a subkey from a hash set', async () => {
    await db.transaction(async (client) => {
      await client.hset('test-hm-key', complexVal)
    })
    expect(await db.hdel('test-hm-key', 'subKey')).to.equal(1)
    expect(await db.hgetall('test-hm-key')).to.not.have.key('subKey')
  })
})
