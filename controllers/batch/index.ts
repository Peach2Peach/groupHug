import { Express } from 'express'
import { addResponseHeaders } from '../../middleware/addResponseHeaders'
import getLogger from '../../src/utils/logger'
import { getBatchStatusController } from './getBatchStatusController'
import { validateGetBatchStatus } from './validation'

const serverLogger = getLogger('server', 'log')

export const Batch = (app: Express): void => {
  app.get(
    '/v1/batch',
    addResponseHeaders({
      'Cache-control': 'public, max-age=60',
    }),
    validateGetBatchStatus,
    getBatchStatusController,
  )

  serverLogger.info('Installed batch endpoints')
}
