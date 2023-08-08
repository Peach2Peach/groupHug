import { Express } from 'express'
import getLogger from '../../src/utils/logger'
import { addPSBTController } from './addPSBTController'
import { validatePSBT } from './validation'

const serverLogger = getLogger('server', 'log')

export const Queue = (app: Express): void => {
  app.post('/v1/addPSBT', validatePSBT, addPSBTController)
  app.post('/v1/addPSBT', validatePSBT, addPSBTController)

  serverLogger.info('Installed queue endpoints')
}
