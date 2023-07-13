import { FEE, decryptConfig, decrypted, initWallets } from '../../constants'
import { initJobs } from '../../cronjobs'
import { initDatabase } from '../../src/utils/db'
import getLogger from '../../src/utils/logger'
import { StartRequest, StartResponse } from './types'
const serverLogger = getLogger('server', 'log')

export const startController = async (req: StartRequest, res: StartResponse) => {
  if (decrypted) {
    return res.json({ success: true })
  }

  const { password } = req.body
  const success = password ? decryptConfig(password) : false

  if (success) {
    await initDatabase()
    initWallets()
    initJobs()
    serverLogger.info('Server initialised!')
    serverLogger.info(['Fee:', FEE])
  }
  res.json({ success })
}

export default startController
