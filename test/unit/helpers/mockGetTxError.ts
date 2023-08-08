import { BLOCKEXPLORERURL } from '../../../constants'
import { fetchStub } from '../hooks'
import { getFetchResponse } from './getFetchResponse'

export const mockGetTxError = (
  txId: string,
  error = 'INTERNAL_SERVER_ERROR',
  status = 500,
) => {
  fetchStub
    .withArgs(`${BLOCKEXPLORERURL}/tx/${txId}`)
    .resolves(getFetchResponse(error, status))
}
