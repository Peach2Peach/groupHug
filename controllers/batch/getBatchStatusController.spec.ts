import chai, { expect } from 'chai'
import { Response } from 'express'
import { describe, it } from 'mocha'
import Sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { markBatchedTransactionAsPending } from '../../cronjobs/batchTransactions/helpers'
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
      saveBucketStatus({
        index: 10,
        participants,
        maxParticipants,
        feeRange: [10, NaN],
      }),
      saveBucketStatus({
        index: 9,
        participants: participants + 1,
        maxParticipants: maxParticipants + 1,
        feeRange: [5, 9],
      }),
      saveBucketStatus({
        index: 8,
        participants: participants + 2,
        maxParticipants: maxParticipants + 2,
        feeRange: [4, 5],
      }),
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
      participants: participants + 1,
      maxParticipants: maxParticipants + 1,
      timeRemaining: 600,
      completed: false,
      feeRange: [5, 9],
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
      participants: participants + 1,
      maxParticipants: maxParticipants + 1,
      timeRemaining: 600,
      feeRange: [5, 9],
      completed: false,
    })
  })
  it('returns batch status of an completed batch for given psbt id', async () => {
    const txId = 'txId'
    const result = await addPSBTToQueue(psbt1, 1)
    await markBatchedTransactionAsPending(
      [{ psbt: psbt1, feeRate: 1 }],
      0,
      txId,
    )
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
      participants: 1,
      maxParticipants: 1,
      timeRemaining: 0,
      completed: true,
      txId,
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
