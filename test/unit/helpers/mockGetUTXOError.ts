import { Response } from 'node-fetch'
import { BLOCKEXPLORERURL } from '../../../constants'
import { fetchStub } from '../hooks'

export const mockGetUTXOError = (
  address: string,
  error = 'INTERNAL_SERVER_ERROR',
  status = 500,
) => {
  fetchStub.withArgs(`${BLOCKEXPLORERURL}/address/${address}/utxo`).resolves({
    json: () => Promise.resolve(error),
    status,
  } as Response)
}
