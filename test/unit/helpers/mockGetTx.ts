import { BLOCKEXPLORERURL } from '../../../constants'
import Sinon from 'sinon'
import * as fetch from '../../../middleware/fetch'
import { Response } from 'node-fetch'

export const mockGetTx = (
  txId: string,
  result: Transaction | string,
  status = 200,
) => {
  Sinon.stub(fetch, 'default')
    .withArgs(`${BLOCKEXPLORERURL}/tx/${txId}`)
    .resolves({
      json: () => Promise.resolve(result),
      status,
    } as Response)
}
