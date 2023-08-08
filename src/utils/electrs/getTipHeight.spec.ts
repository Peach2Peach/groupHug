import { expect } from 'chai'
import { describe, it } from 'mocha'
import { getTipHeight } from '.'
import { BLOCKEXPLORERURL } from '../../../constants'
import { fetchStub } from '../../../test/unit/hooks'

describe('blockExplorer API', () => {
  it('getTipHeight', async () => {
    fetchStub.withArgs(`${BLOCKEXPLORERURL}/blocks/tip/height`).resolves({
      text: () => new Promise((resolve) => resolve('263')),
      status: 200,
    } as Response)
    const result = await getTipHeight()
    expect(result.getValue()).to.deep.equal(263)
  })
  it('should handle errors', async () => {
    const errorMessage = new Error('error message')
    fetchStub.withArgs(`${BLOCKEXPLORERURL}/blocks/tip/height`).rejects(errorMessage)

    const result = await getTipHeight()
    expect(result.getError()).to.deep.equals({
      error: 'INTERNAL_SERVER_ERROR',
      message: errorMessage,
    })
  })
})
