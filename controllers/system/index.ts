import { Express } from 'express'
import { addResponseHeaders } from '../../middleware/addResponseHeaders'
import getLogger from '../../src/utils/logger'
import getStatus from './getStatus'
import start from './start'

const serverLogger = getLogger('server', 'log')

export default (app: Express): void => {
  app.post('/v1/start', start)
  app.get(
    '/v1/system/status',

    addResponseHeaders({
      'Cache-control': 'public, max-age=0',
    }),
    getStatus,
  )

  serverLogger.info('Installed system endpoints')
}
