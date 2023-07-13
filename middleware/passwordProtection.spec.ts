import chai, { expect } from 'chai'
import { Request, Response } from 'express'
import { describe, it } from 'mocha'
import Sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { passwordProtection } from './passwordProtection'
import {
  requestMock,
  responseMock,
} from '../test/unit/controllers/expressMocks'
import * as constants from '../constants'

chai.use(sinonChai)

describe('passwordProtection', () => {
  afterEach(() => {
    Sinon.restore()
  })
  it('calls next function if decrypted is false and url is /v1/start', () => {
    Sinon.stub(constants, 'decrypted').get(() => false)
    const request = requestMock({ url: '/v1/start' })
    const response = responseMock()
    const next = Sinon.stub()

    passwordProtection(request as Request, response as Response, next)

    expect(next).to.have.been.called
  })

  it('returns error if url is any other and decrypted is false', () => {
    Sinon.stub(constants, 'decrypted').get(() => false)

    const request = requestMock({ url: '/v1/psbt' })
    const response = responseMock()
    const next = Sinon.stub()

    passwordProtection(request as Request, response as Response, next)

    expect(next).not.to.have.been.called
    expect(response.status).to.have.been.calledWith(503)
    expect(response.json).to.have.been.calledWith({
      error: 'SERVICE_UNAVAILABLE',
    })
  })
  it('calls next function if decrypted is true', () => {
    Sinon.stub(constants, 'decrypted').get(() => true)

    const request = requestMock({ url: '/v1/psbt' })
    const response = responseMock()
    const next = Sinon.stub()

    passwordProtection(request as Request, response as Response, next)

    expect(next).to.have.been.called
  })
})
