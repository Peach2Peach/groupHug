import chai, { expect } from 'chai'
import { Request, Response } from 'express'
import { describe, it } from 'mocha'
import Sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { validatePSBT } from './validatePSBT'
import {
  batchQueue,
  missingSignature,
  psbtWith2ndInput,
  psbtWith2ndOutput,
  validEntryPSBTBase64,
  wrongSighash,
} from '../../../test/data/psbtData'
import {
  requestMock,
  responseMock,
} from '../../../test/unit/controllers/expressMocks'
import { Psbt } from 'bitcoinjs-lib'

chai.use(sinonChai)

describe('validatePSBT', () => {
  it('validates psbt successfully', () => {
    const request = requestMock({
      body: batchQueue[0],
    })
    const response = responseMock()
    const next = Sinon.stub()

    validatePSBT(request as Request, response as Response, next)

    expect(next).to.have.been.called
  })

  it('returns error if psbt is not of type string', () => {
    const request = requestMock({
      body: { psbt: 0, feeRate: 10, index: 0 },
    })

    const response = responseMock()
    const next = Sinon.stub()

    validatePSBT(request as Request, response as Response, next)

    expect(next).not.to.have.been.called
    expect(response.status).to.have.been.calledWith(400)
    expect(response.json).to.have.been.calledWith({
      error: 'BAD_REQUEST',
    })
  })
  it('returns error if psbt has no signature', () => {
    const request = requestMock({
      body: { psbt: missingSignature, feeRate: 10, index: 0 },
    })

    const response = responseMock()
    const next = Sinon.stub()

    validatePSBT(request as Request, response as Response, next)

    expect(next).not.to.have.been.called
    expect(response.status).to.have.been.calledWith(400)
    expect(response.json).to.have.been.calledWith({
      error: 'BAD_REQUEST',
    })
  })
  it('returns error if psbt has wrong signature', () => {
    const wrongSig = Psbt.fromBase64(missingSignature)
    wrongSig.data.inputs[0].finalScriptSig = Buffer.from('0')
    const request = requestMock({
      body: { psbt: wrongSig.toBase64(), feeRate: 10, index: 0 },
    })

    const response = responseMock()
    const next = Sinon.stub()

    validatePSBT(request as Request, response as Response, next)

    expect(next).not.to.have.been.called
    expect(response.status).to.have.been.calledWith(400)
    expect(response.json).to.have.been.calledWith({
      error: 'BAD_REQUEST',
    })
  })
  it('returns error if psbt has wrong sighash', () => {
    const request = requestMock({
      body: { psbt: wrongSighash, feeRate: 10, index: 0 },
    })

    const response = responseMock()
    const next = Sinon.stub()

    validatePSBT(request as Request, response as Response, next)

    expect(next).not.to.have.been.called
    expect(response.status).to.have.been.calledWith(400)
    expect(response.json).to.have.been.calledWith({
      error: 'BAD_REQUEST',
    })
  })
  it('returns error if psbt is invalid', () => {
    const request = requestMock({
      body: { psbt: 'invalid base64', feeRate: 10, index: 0 },
    })

    const response = responseMock()
    const next = Sinon.stub()

    validatePSBT(request as Request, response as Response, next)

    expect(next).not.to.have.been.called
    expect(response.status).to.have.been.calledWith(400)
    expect(response.json).to.have.been.calledWith({
      error: 'BAD_REQUEST',
    })
  })
  it('returns error if psbt has more than 2 inputs', () => {
    const request = requestMock({
      body: { psbt: psbtWith2ndInput, feeRate: 10, index: 0 },
    })

    const response = responseMock()
    const next = Sinon.stub()

    validatePSBT(request as Request, response as Response, next)

    expect(next).not.to.have.been.called
    expect(response.status).to.have.been.calledWith(400)
    expect(response.json).to.have.been.calledWith({
      error: 'BAD_REQUEST',
    })
  })
  it('returns error if psbt has more than 2 outputs', () => {
    const request = requestMock({
      body: { psbt: psbtWith2ndOutput, feeRate: 10, index: 0 },
    })

    const response = responseMock()
    const next = Sinon.stub()

    validatePSBT(request as Request, response as Response, next)

    expect(next).not.to.have.been.called
    expect(response.status).to.have.been.calledWith(400)
    expect(response.json).to.have.been.calledWith({
      error: 'BAD_REQUEST',
    })
  })
  it('returns error if fee rate less than 1', () => {
    const request = requestMock({
      body: { psbt: validEntryPSBTBase64, feeRate: 0, index: 0 },
    })
    const response = responseMock()
    const next = Sinon.stub()

    validatePSBT(request as Request, response as Response, next)

    expect(next).not.to.have.been.called
    expect(response.status).to.have.been.calledWith(400)
    expect(response.json).to.have.been.calledWith({
      error: 'BAD_REQUEST',
    })
  })
  it('returns error if fee rate is invalid', () => {
    const request = requestMock({
      body: { psbt: validEntryPSBTBase64, feeRate: 'a', index: 0 },
    })
    const response = responseMock()
    const next = Sinon.stub()

    validatePSBT(request as Request, response as Response, next)

    expect(next).not.to.have.been.called
    expect(response.status).to.have.been.calledWith(400)
    expect(response.json).to.have.been.calledWith({
      error: 'BAD_REQUEST',
    })
  })
  it('returns error if fee rate is bigger than max possible fee rate for PSBT', () => {
    const request = requestMock({
      body: { psbt: validEntryPSBTBase64, feeRate: 31, index: 0 },
    })
    const response = responseMock()
    const next = Sinon.stub()

    validatePSBT(request as Request, response as Response, next)

    expect(next).not.to.have.been.called
    expect(response.status).to.have.been.calledWith(400)
    expect(response.json).to.have.been.calledWith({
      error: 'BAD_REQUEST',
    })
  })
})
