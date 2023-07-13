import { FEE, NETWORK } from '../../constants'
import { decryptConfig, decrypted } from '../../src/utils/system/decryptConfig'
import { initWallets } from '../../src/wallets/initWallets'
import { initJobs } from '../../cronjobs/initJobs'
import { initDatabase } from '../../src/utils/db'
import getLogger from '../../src/utils/logger'
import { StartRequest, StartResponse } from './types'
const serverLogger = getLogger('server', 'log')

export const startController = async (req: StartRequest, res: StartResponse) => {
  if (decrypted) {
    return res.json({ success: true })
  }

  const { password } = req.body
  try {
    const { PRIVKEY, FEE_COLLECTOR_PUBKEY } = decryptConfig(password)

    if (decrypted) {
      await initDatabase()
      initWallets(PRIVKEY, FEE_COLLECTOR_PUBKEY, NETWORK)
      initJobs()
      serverLogger.info('Server initialised!')
      serverLogger.info(['Fee:', FEE])
    }
    res.json({ success: decrypted })
  } catch (e) {
    serverLogger.error(['Failed server start attempt'])
    res.json({ success: false })
  }
}
