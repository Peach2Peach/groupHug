/* eslint-disable max-len */
import { networks } from 'bitcoinjs-lib'
import { SinonStub } from 'sinon'
import { setFee, setNetwork } from '../../constants'
import { db, disconnectDatabases, initDatabase, setClients } from '../../src/utils/db'

let dbId: number

export let fetchStub: SinonStub
export const mochaHooks = {
  beforeAll: async () => {
    setFee(2)

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

  afterEach: async () => {
    await db.client.sendCommand(['FLUSHDB'])
  },
}
