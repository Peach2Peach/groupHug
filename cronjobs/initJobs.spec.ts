/* eslint-disable no-underscore-dangle */
import chai, { expect } from 'chai'
import cron from 'node-cron'
import Sinon, { SinonStub } from 'sinon'
import sinonChai from 'sinon-chai'
import { initJobs } from './initJobs'
import * as batchTransactions from './batchTransactions/batchTransactions'

chai.use(sinonChai)
describe('initJobsStub', () => {
  let batchTransactionsStub: SinonStub
  before(async () => {
    batchTransactionsStub = Sinon.stub(batchTransactions, 'batchTransactions')
    initJobs()
    await Promise.all(
      Array.from(cron.getTasks().values()).map((task) =>
        // @ts-ignore
        task._task._execution(),
      ),
    )
  })
  after(() => {
    Sinon.restore()
  })
  it('should init the batching job', () => {
    expect(batchTransactionsStub).to.have.been.called
  })
})
