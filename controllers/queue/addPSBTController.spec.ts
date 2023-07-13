import chai, { expect } from 'chai'
import { Response } from 'express'
import { describe, it } from 'mocha'
import Sinon, { SinonStub } from 'sinon'
import sinonChai from 'sinon-chai'
import { db } from '../../src/utils/db'
import { TransactionResult } from '../../src/utils/db/TransactionResult'
import { KEYS } from '../../src/utils/db/keys'
import { getPSBTsFromQueue } from '../../src/utils/queue'
import * as addPSBTToQueue from '../../src/utils/queue/addPSBTToQueue'
import blockExplorerData from '../../test/data/blockExplorerData.json'
import { validEntryPSBT, validEntryPSBTBase64 } from '../../test/data/psbtData'
import {
  requestMock,
  responseMock,
} from '../../test/unit/controllers/expressMocks'
import { mockGetTx } from '../../test/unit/helpers/mockGetTx'
import { addPSBTController } from './addPSBTController'
import { AddPSBTRequest } from './types'

chai.use(sinonChai)

describe('addPSBTController', () => {
  const confirmedTx = {
    ...blockExplorerData.tx,
    vout: [blockExplorerData.tx.vout[0]],
  }
  const unConfirmedTx = { ...confirmedTx, status: { confirmed: false } }

  afterEach(() => {
    Sinon.restore()
  })
  it('accepts psbt and stores it in the queue with correct fee rate', async () => {
    mockGetTx(validEntryPSBT.txInputs[0].hash.toString('hex'), confirmedTx)
    const request = requestMock({
      body: { psbt: validEntryPSBTBase64, feeRate: 10 },
    })
    const response = responseMock()

    await addPSBTController(request as AddPSBTRequest, response as Response)

    expect(await getPSBTsFromQueue(10, 10)).to.deep.include(validEntryPSBT)
    expect(response.json).to.be.calledWith({
      id: Sinon.match.string,
      revocationToken: Sinon.match.string,
    })

    const [jsonResponse] = (response.json as SinonStub).getCall(0).args
    expect(jsonResponse.id.length).to.equal(64)
    expect(jsonResponse.revocationToken.length).to.equal(32)
    expect(await db.hgetall(KEYS.PSBT.PREFIX + jsonResponse.id)).to.deep.equal({
      psbt: validEntryPSBTBase64,
      revocationToken: jsonResponse.revocationToken,
    })
  })

  it('returns BAD_REQUEST error if inputs are not yet confirmed', async () => {
    mockGetTx(validEntryPSBT.txInputs[0].hash.toString('hex'), unConfirmedTx)
    const request = requestMock({
      body: { psbt: validEntryPSBTBase64, feeRate: 10 },
    })
    const response = responseMock()

    await addPSBTController(request as AddPSBTRequest, response as Response)

    expect(response.status).to.have.been.calledWith(400)
    expect(response.json).to.have.been.calledWith({
      error: 'BAD_REQUEST',
    })
  })
  it('returns INTERNAL_SERVER_ERROR if psbt could not be added to queue', async () => {
    Sinon.stub(addPSBTToQueue, 'addPSBTToQueue').resolves(
      new TransactionResult(false, undefined, 'error'),
    )
    mockGetTx(validEntryPSBT.txInputs[0].hash.toString('hex'), confirmedTx)
    const request = requestMock({
      body: { psbt: validEntryPSBTBase64, feeRate: 10 },
    })
    const response = responseMock()

    await addPSBTController(request as AddPSBTRequest, response as Response)

    expect(response.status).to.have.been.calledWith(500)
    expect(response.json).to.have.been.calledWith({
      error: 'INTERNAL_SERVER_ERROR',
    })
  })
})
