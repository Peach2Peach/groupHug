import { expect } from 'chai'
import { SinonStub } from 'sinon'
import {
  requestMock,
  responseMock,
} from '../../test/unit/controllers/expressMocks'
import { getStatusController } from './getStatusController'
import { GetStatusRequest, GetStatusResponse } from './types'

describe('getStatusController', () => {
  it('returns grouhug info', () => {
    const statusRequest = requestMock()
    const statusResponse = responseMock()

    getStatusController(
      statusRequest as GetStatusRequest,
      statusResponse as GetStatusResponse,
    )

    const [response] = (statusResponse.json as SinonStub).getCall(0).args

    expect(response.error).to.be.equal(null)
    expect(response.status).to.be.equal('online')
    expect(typeof response.serverTime === 'number').to.be.true
  })
})
