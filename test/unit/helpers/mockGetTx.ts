import { Response } from 'node-fetch'
import { BLOCKEXPLORERURL } from '../../../constants'
import { fetchStub } from '../hooks'

export const mockGetTx = (
  txId: string,
  result: Transaction | string,
  status = 200,
) => {
  fetchStub.withArgs(`${BLOCKEXPLORERURL}/tx/${txId}`).resolves({
    json: () => Promise.resolve(result),
    status,
  } as Response)
}
