import chai, { expect } from 'chai'
import { describe, it } from 'mocha'
import { db } from '.'
import Sinon from 'sinon'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('transaction', () => {
  afterEach(() => {
    Sinon.restore()
  })
  it('should execute transaction and return transaction result', async () => {
    const result = await db.transaction(async (client) => {
      await client.set('test', 1)
      return 'myResult'
    })
    expect(result.isOk()).to.be.true
    expect(result.getResult()).to.equal('myResult')
    expect(await db.get('test')).to.equal('1')
  })
  it('should discard transaction if transaction function returns false', async () => {
    const result = await db.transaction(async (client) => {
      await client.set('test', 1)
      return false
    })
    expect(result.isError()).to.be.true
    expect(result.getError()).to.equal('transaction aborted')
    expect(await db.get('test')).to.equal(null)
  })
  it('should handle errors', async () => {
    try {
      await db.transaction(() => {
        throw new Error('error')
      })
      throw new Error('Function did not throw an error')
    } catch (error) {
      expect(error.message).to.equal('error')
    }
  })
  it('should retry on optimistic locking failured', async () => {
    const multiStub = {
      set: Sinon.stub(),
      exec: Sinon.stub().resolves('ok')
        .onSecondCall()
        .resolves(null),
      discard: Sinon.stub(),
    }

    Sinon.stub(db.client, 'executeIsolated').callsFake(async (callback) => {
      const isolatedClient = {
        watch: Sinon.stub(),
        multi: () => multiStub,
      }
      // @ts-ignore
      await callback(isolatedClient)
    })
    const result1 = await db.transaction((client) => client.set('test', '1'))
    expect(result1.isOk()).to.be.true
    expect(multiStub.exec).to.have.been.calledOnce
    const result2 = await db.transaction((client) => client.set('test', '2'))
    expect(result2.isOk()).to.be.true
    expect(multiStub.exec).to.have.been.calledThrice
  })
})
