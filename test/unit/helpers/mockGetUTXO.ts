import { BLOCKEXPLORERURL } from '../../../constants'
import { fetchStub } from '../hooks'
import { getFetchResponse } from './getFetchResponse'

export const mockGetUTXO = (address: string, result: UTXO[], status = 200) => {
  fetchStub
    .withArgs(`${BLOCKEXPLORERURL}/address/${address}/utxo`)
    .resolves(getFetchResponse(result, status))
}
