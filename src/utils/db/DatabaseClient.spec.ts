import chai, { expect } from 'chai'
import { DatabaseClient } from './DatabaseClient'
import * as redis from 'redis'
import Sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { errorListener } from './errorListener'
chai.use(sinonChai)

describe('DatabaseClient', () => {
  const fakeClient = {
    on: Sinon.stub(),
    connect: Sinon.stub(),
  }
  let createClientStub: Sinon.SinonStub
  before(() => {
    // @ts-ignore
    createClientStub = Sinon.stub(redis, 'createClient').returns(fakeClient)
  })
  after(() => {
    Sinon.restore()
  })
  it('constructs a db client', () => {
    const options = {
      url: 'redis://',
      password: 'grouphug',
      database: 7,
    }
    const db = new DatabaseClient(options)
    expect(db).to.be.instanceOf(DatabaseClient)
    expect(db.client).to.deep.equal(fakeClient)
    expect(fakeClient.on).to.have.been.calledWith('error', errorListener)
    expect(createClientStub).to.have.been.calledWith(options)
    expect(fakeClient.connect).to.have.been.called
  })
})
