import { Psbt, networks } from 'bitcoinjs-lib'
import chai, { expect } from 'chai'
import { Request, Response } from 'express'
import { describe, it } from 'mocha'
import Sinon from 'sinon'
import sinonChai from 'sinon-chai'
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
import { validatePSBT } from './validatePSBT'

chai.use(sinonChai)

describe('validatePSBT', () => {
  const highFeePsbt = batchQueue[batchQueue.length - 1]

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
      details: '',
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
      details: 'SIGNATURE_INVALID',
      error: 'BAD_REQUEST',
    })
  })
  it('returns error if psbt has wrong signature', () => {
    const wrongSig = Psbt.fromBase64(missingSignature, {
      network: networks.regtest,
    })
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
      details: 'SIGNATURE_INVALID',
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
      details: 'WRONG_SIGHASH',
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
      details: '',
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
      details: 'INVALID_INPUTS',
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
      details: 'INVALID_OUTPUTS',
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
      details: '',
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
      details: '',
      error: 'BAD_REQUEST',
    })
  })
  it('returns error if desired user fee rate is bigger than max possible fee rate for PSBT', () => {
    const request = requestMock({
      body: { ...highFeePsbt, feeRate: 39 },
    })

    const response = responseMock()
    const next = Sinon.stub()

    validatePSBT(request as Request, response as Response, next)

    expect(next).not.to.have.been.called
    expect(response.status).to.have.been.calledWith(400)
    expect(response.json).to.have.been.calledWith({
      details: 'INVALID_FEE_RATE',
      feeRate: 39,
      finalFeeRate: 38.24742268041237,
      error: 'BAD_REQUEST',
    })
  })
  it('validates psbt successfully if desired fee rate is below actual fee rate (donation)', () => {
    const request = requestMock({
      body: { ...highFeePsbt, feeRate: 37 },
    })
    const response = responseMock()
    const next = Sinon.stub()

    validatePSBT(request as Request, response as Response, next)

    expect(next).to.have.been.called
  })
})
