import { Express } from 'express'
import getLogger from '../../src/utils/logger'
import { getBatchStatusController } from './getBatchStatusController'
import { validateGetBatchStatus } from './validation'

const serverLogger = getLogger('server', 'log')

export const Batch = (app: Express): void => {
  app.post('/v1/batch', validateGetBatchStatus, getBatchStatusController)

  serverLogger.info('Installed batch endpoints')
}
