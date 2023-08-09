import chai, { expect } from 'chai'
import { Response } from 'express'
import { describe, it } from 'mocha'
import Sinon from 'sinon'
import sinonChai from 'sinon-chai'
import * as getFeeEstimates from '../../src/utils/electrs/getFeeEstimates'
import {
  addPSBTToQueue,
  resetAllBucketExpirations,
  saveBucketStatus,
} from '../../src/utils/queue'
import { getError, getResult } from '../../src/utils/result'
import { feeEstimates } from '../../test/data/electrsData'
import { psbt1 } from '../../test/data/psbtData'
import {
  requestMock,
  responseMock,
} from '../../test/unit/controllers/expressMocks'
import { getBatchStatusController } from './getBatchStatusController'
import { GetBatchStatusRequest } from './types'

chai.use(sinonChai)

describe('getBatchStatusController', () => {
  const participants = 10
  const maxParticipants = 20

  beforeEach(async () => {
    await Promise.all([
      resetAllBucketExpirations(),
      saveBucketStatus(10, participants, maxParticipants),
      saveBucketStatus(9, participants + 1, maxParticipants + 1),
      saveBucketStatus(8, participants + 2, maxParticipants + 2),
    ])
  })

  it('returns batch status of an ongoing batch for given feeRate', async () => {
    Sinon.stub(getFeeEstimates, 'getFeeEstimates').resolves(
      getResult(feeEstimates),
    )
    const request = requestMock({ query: { feeRate: '1' } })
    const response = responseMock()
    await getBatchStatusController(
      request as GetBatchStatusRequest,
      response as Response,
    )

    expect(response.json).to.be.calledWith({
      index: 9,
      participants: participants + 1,
      maxParticipants: maxParticipants + 1,
      timeRemaining: 600,
    })
  })
  it('returns batch status of an ongoing batch for given psbt id', async () => {
    const result = await addPSBTToQueue(psbt1, 1)
    Sinon.stub(getFeeEstimates, 'getFeeEstimates').resolves(
      getResult(feeEstimates),
    )
    const request = requestMock({ query: { id: result.getResult().id } })
    const response = responseMock()
    await getBatchStatusController(
      request as GetBatchStatusRequest,
      response as Response,
    )

    expect(response.json).to.be.calledWith({
      index: 9,
      participants: participants + 1,
      maxParticipants: maxParticipants + 1,
      timeRemaining: 600,
    })
  })
  it('returns not found if not bucket status has been registered', async () => {
    Sinon.stub(getFeeEstimates, 'getFeeEstimates').resolves(
      getResult(feeEstimates),
    )
    const request = requestMock({ query: { feeRate: '20' } })
    const response = responseMock()
    await getBatchStatusController(
      request as GetBatchStatusRequest,
      response as Response,
    )

    expect(response.status).to.be.calledWith(404)
    expect(response.json).to.be.calledWith({ error: 'NOT_FOUND' })
  })
  it('returns internal server error if fee estimate could not be fetched', async () => {
    Sinon.stub(getFeeEstimates, 'getFeeEstimates').resolves(
      getError({ error: 'INTERNAL_SERVER_ERROR' }),
    )
    const request = requestMock({ query: { feeRate: '20' } })
    const response = responseMock()
    await getBatchStatusController(
      request as GetBatchStatusRequest,
      response as Response,
    )

    expect(response.status).to.be.calledWith(500)
    expect(response.json).to.be.calledWith({ error: 'INTERNAL_SERVER_ERROR' })
  })
})
