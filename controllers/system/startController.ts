import { BATCH_SIZE_THRESHOLD, BATCH_TIME_THRESHOLD, BUCKETS, NETWORK } from '../../constants'
import { initJobs } from '../../cronjobs/initJobs'
import { initDatabase } from '../../src/utils/db'
import getLogger from '../../src/utils/logger'
import { decryptConfig, decrypted } from '../../src/utils/system/decryptConfig'
import { initWallets } from '../../src/wallets'
import { StartRequest, StartResponse } from './types'
export const serverLogger = getLogger('server', 'log')

export const startServer = async (password: string) => {
  const { PRIVKEY, FEE_COLLECTOR_PUBKEY, DB_AUTH } = decryptConfig(password)

  if (decrypted) {
    await initDatabase({ password: DB_AUTH })
    initWallets(PRIVKEY, FEE_COLLECTOR_PUBKEY, NETWORK)
    initJobs()

    serverLogger.info('GroupHug Server initialised!')
    serverLogger.info(['BUCKETS', BUCKETS])
    serverLogger.info(['BATCH_TIME_THRESHOLD', BATCH_TIME_THRESHOLD])
    serverLogger.info(['BATCH_SIZE_THRESHOLD', BATCH_SIZE_THRESHOLD])
  }
  return decrypted
}

export const startController = async (req: StartRequest, res: StartResponse) => {
  if (decrypted) {
    return res.json({ success: true })
  }

  const { password } = req.body
  try {
    res.json({ success: await startServer(password) })
  } catch (e) {
    serverLogger.error(['Failed server start attempt', e])
    res.json({ success: false })
  }
}
