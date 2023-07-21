import chai, { expect } from 'chai'
import { describe, it } from 'mocha'
import sinonChai from 'sinon-chai'
import fetch from './fetch'
import Sinon, { SinonStub } from 'sinon'
import * as nodeFetch from 'node-fetch'
import { fetchLogger } from './fetchLogger'
import { fetchStub } from '../test/unit/hooks'

chai.use(sinonChai)

describe('fetch', () => {
  const url = 'url'
  const options = { method: 'GET' }
  let nodeFetchStub: SinonStub
  let infoStub: SinonStub
  let errorStub: SinonStub

  beforeEach(() => {
    fetchStub.restore()
    nodeFetchStub = Sinon.stub(nodeFetch, 'default')
    infoStub = Sinon.stub(fetchLogger, 'info')
    errorStub = Sinon.stub(fetchLogger, 'error')
  })
  afterEach(() => {
    Sinon.restore()
  })
  it('calls fetch with passed options', () => {
    fetch(url, options)
    expect(nodeFetchStub).to.be.calledWith(url, options)
  })
  it('logs response and resolves result', async () => {
    const expectedResult = { status: 200, statusText: 'ok' }
    nodeFetchStub.returns(Promise.resolve(expectedResult))
    const result = await fetch(url, options)
    expect(result).to.deep.equal(expectedResult)
    expect(infoStub).to.be.calledWith([200, 'ok', 'url'])
  })
  it('logs error and rejects with result', async () => {
    const expectedResult = { status: 500, statusText: 'error' }
    nodeFetchStub.returns(Promise.reject(expectedResult))

    try {
      await fetch(url, options)
    } catch (e) {
      expect(e).to.deep.equal(expectedResult)
      expect(errorStub).to.be.calledWith([500, 'error', 'url', expectedResult])
    }
  })
})
