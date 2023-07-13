import { expect } from 'chai'
import { SinonStub } from 'sinon'

import getStatus from './getStatus'
import { requestMock, responseMock } from '../../test/unit/controllers/expressMocks'
import { GetStatusRequest, GetStatusResponse } from './types'

describe('getStatus', () => {
  it('returns peach info', async () => {
    const statusRequest = requestMock()
    const statusResponse = responseMock()

    await getStatus(statusRequest as GetStatusRequest, statusResponse as GetStatusResponse)

    const [response] = (statusResponse.json as SinonStub).getCall(0).args

    expect(response.error).to.be.equal(null)
    expect(response.status).to.be.equal('online')
    expect(typeof response.serverTime === 'number').to.be.true
  })
})
