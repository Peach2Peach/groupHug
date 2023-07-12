import chai, { expect } from 'chai'
import sinonChai from 'sinon-chai'
import { db } from '..'

chai.use(sinonChai)

describe('zcount', () => {
  beforeEach(async () => {
    await db.transaction(async (client) => {
      await Promise.all([
        client.zadd('test-zcount-key', 1, 'A'),
        client.zadd('test-zcount-key', 2, 'B'),
        client.zadd('test-zcount-key', 3, 'C'),
        client.zadd('test-zcount-key', 4, 'D'),
        client.zadd('test-zcount-key', 5, 'E'),
      ])
    })
  })
  it('should count number of members within a range of scored ', async () => {
    expect(await db.zcount('test-zcount-key', 3, 5)).to.equal(3)
  })
  it('should count number of all members', async () => {
    expect(await db.zcount('test-zcount-key')).to.equal(5)
  })
})
