import { BATCH_SIZE_THRESHOLD, BATCH_TIME_THRESHOLD, BUCKETS, NETWORK } from '../../constants'
import { initJobs } from '../../cronjobs/initJobs'
import { initDatabase } from '../../src/utils/db'
import getLogger from '../../src/utils/logger'
import { FEE_COLLECTOR_PUBKEY, PRIVKEY, decryptConfig, decrypted } from '../../src/utils/system/decryptConfig'
import { initWallets } from '../../src/wallets'
import { StartRequest, StartResponse } from './types'
export const serverLogger = getLogger('server', 'log')

export const startServer = async (password: string) => {
  decryptConfig(password)

  if (decrypted) {
    await initDatabase()
    initWallets(PRIVKEY, FEE_COLLECTOR_PUBKEY, NETWORK)
    initJobs()
    serverLogger.info('Server initialised!')
    serverLogger.info('BUCKETS', BUCKETS)
    serverLogger.info('BATCH_TIME_THRESHOLD', BATCH_TIME_THRESHOLD)
    serverLogger.info('BATCH_TIME_THRESHOLD', BATCH_TIME_THRESHOLD)
  }
}

export const startController = async (req: StartRequest, res: StartResponse) => {
  if (decrypted) {
    return res.json({ success: true })
  }

  const { password } = req.body
  try {
    await startServer(password)
    res.json({ success: decrypted })
  } catch (e) {
    serverLogger.error(['Failed server start attempt'])
    res.json({ success: false })
  }
}
