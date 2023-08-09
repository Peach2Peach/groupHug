import chai, { expect } from 'chai'
import sinonChai from 'sinon-chai'
import { db } from '..'

chai.use(sinonChai)

describe('zinter', () => {
  it('should return intersection of sets', async () => {
    await db.transaction(async (client) => {
      await Promise.all([
        client.zadd('test-zinter-key', 1, 'A'),
        client.zadd('test-zinter-key', 2, 'B'),
        client.zadd('test-zinter-key-2', 1, 'A'),
        client.zadd('test-zinter-key-2', 3, 'C'),
      ])
    })

    expect(
      await db.zinter(['test-zinter-key', 'test-zinter-key-2']),
    ).to.deep.equal(['A'])
  })
})
