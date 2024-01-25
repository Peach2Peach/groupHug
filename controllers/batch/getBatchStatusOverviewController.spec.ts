import chai, { expect } from 'chai'
import { Response } from 'express'
import { describe, it } from 'mocha'
import Sinon from 'sinon'
import sinonChai from 'sinon-chai'
import * as getFeeEstimates from '../../src/utils/electrs/getFeeEstimates'
import {
  resetAllBucketExpirations,
  saveBucketStatus,
} from '../../src/utils/queue'
import { getResult } from '../../src/utils/result'
import { feeEstimates } from '../../test/data/electrsData'
import {
  requestMock,
  responseMock,
} from '../../test/unit/controllers/expressMocks'
import { getBatchStatusOverviewController } from './getBatchStatusOverviewController'
import { GetBatchStatusRequest } from './types'

chai.use(sinonChai)

describe('getBatchStatusOverviewController', () => {
  const participants = 10
  const maxParticipants = 20

  beforeEach(async () => {
    await Promise.all([
      resetAllBucketExpirations(),
      saveBucketStatus({ index: 10, participants, maxParticipants }),
      saveBucketStatus({
        index: 9,
        participants: participants + 1,
        maxParticipants: maxParticipants + 1,
      }),
      saveBucketStatus({
        index: 8,
        participants: participants + 2,
        maxParticipants: maxParticipants + 2,
      }),
    ])
  })

  it('returns batch status of an ongoing batches', async () => {
    Sinon.stub(getFeeEstimates, 'getFeeEstimates').resolves(
      getResult(feeEstimates),
    )
    const request = requestMock()
    const response = responseMock()
    await getBatchStatusOverviewController(
      request as GetBatchStatusRequest,
      response as Response,
    )

    expect(response.json).to.be.calledWith([
      {
        participants: 12,
        maxParticipants: 22,
        feeRange: [NaN, NaN],
        timeRemaining: -2,
        completed: false,
      },
      {
        participants: 11,
        maxParticipants: 21,
        feeRange: [NaN, NaN],
        timeRemaining: -2,
        completed: false,
      },
    ])
  })
})
