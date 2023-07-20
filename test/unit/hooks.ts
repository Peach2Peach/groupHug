import { networks } from 'bitcoinjs-lib'
import Sinon, { SinonStub } from 'sinon'
import { NETWORK, setNetwork } from '../../constants'
import * as fetch from '../../middleware/fetch'
import {
  db,
  disconnectDatabases,
  initDatabase,
  setClients,
} from '../../src/utils/db'
import { initWallets } from '../../src/wallets'
import { unencrypted } from '../data/envData'

let dbId: number

export let fetchStub: SinonStub
export const mochaHooks = {
  beforeAll: async () => {
    initWallets(unencrypted.PRIVKEY, unencrypted.FEE_COLLECTOR_PUBKEY, NETWORK)
    if (!dbId) {
      await initDatabase({ database: 7 })
      // eslint-disable-next-line require-atomic-updates
      dbId = (await db.client.incr('test-db')) + 7
      await db.client.expire('test-db', 60)
      await disconnectDatabases()
      await initDatabase({ database: dbId })
    } else {
      setClients(db)
    }

    setNetwork(networks.regtest)
  },
  beforeEach: () => {
    fetchStub = Sinon.stub(fetch, 'default')
  },

  afterEach: async () => {
    Sinon.restore()
    await db.client.sendCommand(['FLUSHDB'])
  },
}
