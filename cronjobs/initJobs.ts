import cron from 'node-cron'
import { logJobExecution } from '../src/utils/job'
import getLogger from '../src/utils/logger'
import { batchTransactions } from './batchTransactions/batchTransactions'
import { checkTransactionStatus } from './checkTransactionStatus/checkTransactionStatus'

const serverLogger = getLogger('server', 'log')

export const initJobs = () => {
  cron.schedule('*/10 * * * *', () => logJobExecution('batchTransactions', batchTransactions))

  cron.schedule('30 */10 * * * *', () => logJobExecution('checkTransactionStatus', checkTransactionStatus))

  serverLogger.info('Jobs initialised!')
}
