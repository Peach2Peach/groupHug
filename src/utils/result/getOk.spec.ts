import { expect } from 'chai'
import { getOk } from './getOk'

describe('getOk', () => {
  it('returns a ok object', () => {
    const success = 1
    const result = getOk(success)
    expect(result.isOk()).to.be.true
    expect(result.getValue()).to.equal(success)
    expect(result.isError()).to.be.false
    expect(result.getError()).to.be.undefined
  })
})
