import chai, { expect } from 'chai'
import Sinon, { SinonStub } from 'sinon'
import sinonChai from 'sinon-chai'
import * as initJobs from '../../cronjobs/initJobs'
import * as initDatabase from '../../src/utils/db'
import * as decryptConfig from '../../src/utils/system/decryptConfig'
import * as initWallets from '../../src/wallets/initWallets'
import { encrypted, unencrypted } from '../../test/data/envData'
import { xpriv, xpub } from '../../test/data/walletData'
import {
  requestMock,
  responseMock,
} from '../../test/unit/controllers/expressMocks'
import { startController } from './startController'
import { StartRequest, StartResponse } from './types'
import { networks } from 'bitcoinjs-lib'

chai.use(sinonChai)

describe('startController', () => {
  const password = 'password'
  let decryptConfigStub: SinonStub
  let initDatabaseStub: SinonStub
  let initWalletsStub: SinonStub
  let initJobsStub: SinonStub

  beforeEach(() => {
    decryptConfigStub = Sinon.stub(decryptConfig, 'decryptConfig').callsFake(
      () => {
        decryptConfig.setDecrypted(true)
        return unencrypted
      },
    )
    initDatabaseStub = Sinon.stub(initDatabase, 'initDatabase')
    initWalletsStub = Sinon.stub(initWallets, 'initWallets')
    initJobsStub = Sinon.stub(initJobs, 'initJobs')
  })
  afterEach(() => {
    decryptConfig.setDecrypted(false)
    Sinon.restore()
  })
  it('should start server by decrypting config, init database and wallets', async () => {
    const statusRequest = requestMock({
      body: { password },
    })
    const statusResponse = responseMock()

    await startController(
      statusRequest as StartRequest,
      statusResponse as StartResponse,
    )

    expect(decryptConfigStub).to.have.been.calledWith(password)
    expect(initDatabaseStub).to.have.been.called
    expect(initWalletsStub).to.have.been.calledWith(
      xpriv,
      xpub,
      networks.regtest,
    )
    expect(initJobsStub).to.have.been.called
    expect(statusResponse.json).to.have.been.calledWith({ success: true })
  })
  it('should return success when already decrypted', async () => {
    decryptConfig.setDecrypted(true)
    const statusRequest = requestMock({
      body: { password },
    })
    const statusResponse = responseMock()

    await startController(
      statusRequest as StartRequest,
      statusResponse as StartResponse,
    )

    expect(decryptConfigStub).not.to.have.been.called
    expect(initDatabaseStub).not.to.have.been.called
    expect(initWalletsStub).not.to.have.been.called
    expect(initJobsStub).not.to.have.been.called
    expect(statusResponse.json).to.have.been.calledWith({ success: true })
  })
  it('should not initialise database and wallets if decryption failed', async () => {
    decryptConfigStub.callsFake(() => {
      decryptConfig.setDecrypted(false)
      return encrypted
    })
    const statusRequest = requestMock({
      body: { password },
    })
    const statusResponse = responseMock()

    await startController(
      statusRequest as StartRequest,
      statusResponse as StartResponse,
    )

    expect(initDatabaseStub).not.to.have.been.called
    expect(initWalletsStub).not.to.have.been.called
    expect(initJobsStub).not.to.have.been.called
    expect(statusResponse.json).to.have.been.calledWith({ success: false })
  })
  it('should not initialise database and wallets if decryption threw error', async () => {
    decryptConfigStub.throws()
    const statusRequest = requestMock({
      body: { password },
    })
    const statusResponse = responseMock()

    await startController(
      statusRequest as StartRequest,
      statusResponse as StartResponse,
    )

    expect(initDatabaseStub).not.to.have.been.called
    expect(initWalletsStub).not.to.have.been.called
    expect(initJobsStub).not.to.have.been.called
    expect(statusResponse.json).to.have.been.calledWith({ success: false })
  })
})
