import chai, { expect } from 'chai'
import { Request, Response } from 'express'
import { describe, it } from 'mocha'
import Sinon from 'sinon'
import sinonChai from 'sinon-chai'
import {
  requestMock,
  responseMock,
} from '../../../test/unit/controllers/expressMocks'
import { validateGetBatchStatus } from './validateGetBatchStatus'

chai.use(sinonChai)

describe('validateGetBatchStatus', () => {
  it('validates feeRate successfully', () => {
    const request = requestMock({ query: { feeRate: '1' } })
    const response = responseMock()
    const next = Sinon.stub()

    validateGetBatchStatus(request as Request, response as Response, next)

    expect(next).to.have.been.called
  })

  it('returns error if fee rate less than 1', () => {
    const request = requestMock({ query: { feeRate: 0 } })
    const response = responseMock()
    const next = Sinon.stub()

    validateGetBatchStatus(request as Request, response as Response, next)

    expect(next).not.to.have.been.called
    expect(response.status).to.have.been.calledWith(400)
    expect(response.json).to.have.been.calledWith({ error: 'BAD_REQUEST' })
  })
  it('returns error if fee rate is invalid', () => {
    const request = requestMock({ body: { feeRate: 'a' } })
    const response = responseMock()
    const next = Sinon.stub()

    validateGetBatchStatus(request as Request, response as Response, next)

    expect(next).not.to.have.been.called
    expect(response.status).to.have.been.calledWith(400)
    expect(response.json).to.have.been.calledWith({ error: 'BAD_REQUEST' })
  })
})
