import { Express } from 'express'
import getLogger from '../../src/utils/logger'
import { addPSBTController } from './addPSBTController'
import { validatePSBT } from './validation'

const serverLogger = getLogger('server', 'log')

export const rest = (app: Express): void => {
  app.post('/v1/addPSBT', validatePSBT, addPSBTController)

  serverLogger.info('Installed user endpoints')
}
