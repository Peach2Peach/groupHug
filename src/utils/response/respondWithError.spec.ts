import chai, { expect } from 'chai'
import { Response } from 'express'
import { responseMock } from '../../../test/unit/controllers/expressMocks'
import { respondWithError } from './respondWithError'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)

describe('respondWithError', () => {
  it('responds with error and code', () => {
    const response = responseMock({})
    respondWithError(response as Response, 'BAD_REQUEST')
    expect(response.status).to.have.been.calledWith(400)
    expect(response.json).to.have.been.calledWith({
      error: 'BAD_REQUEST',
    })
  })
})
