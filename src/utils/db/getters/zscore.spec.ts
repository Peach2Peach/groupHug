import chai, { expect } from 'chai'
import sinonChai from 'sinon-chai'
import { db } from '..'

chai.use(sinonChai)

describe('zscore', () => {
  it('should return score of value', async () => {
    await db.transaction(async (client) => {
      await Promise.all([
        client.zadd('test-zscore-key', 1, 'A'),
        client.zadd('test-zscore-key', 2, 'B'),
      ])
    })

    expect(await db.zscore('test-zscore-key', 'B')).to.equal(2)
  })
})
