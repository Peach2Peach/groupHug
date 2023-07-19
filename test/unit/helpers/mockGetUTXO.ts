import { Response } from 'node-fetch'
import { BLOCKEXPLORERURL } from '../../../constants'
import { fetchStub } from '../hooks'

export const mockGetUTXO = (address: string, result: UTXO[], status = 200) => {
  fetchStub.withArgs(`${BLOCKEXPLORERURL}/address/${address}/utxo`).resolves({
    json: () => Promise.resolve(result),
    status,
  } as Response)
}
