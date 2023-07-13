import { expect } from 'chai'
import { getResult } from './getResult'

describe('getResult', () => {
  it('returns as error by default', () => {
    const result = getResult()
    expect(result.isOk()).to.be.false
    expect(result.getValue()).to.be.undefined
    expect(result.isError()).to.be.true
    expect(result.getError()).to.be.undefined
  })
  it('returns a success result object', () => {
    const success = 1
    const result = getResult(success)
    expect(result.isOk()).to.be.true
    expect(result.getValue()).to.equal(success)
    expect(result.isError()).to.be.false
    expect(result.getError()).to.be.undefined
  })
  it('returns an error result object', () => {
    const error = new Error()
    const result = getResult(undefined, error)
    expect(result.isOk()).to.be.false
    expect(result.getValue()).to.be.undefined
    expect(result.isError()).to.be.true
    expect(result.getError()).to.equal(error)
  })

  it('indicates that it is not ok when there is an error even if there is a result', () => {
    const success = 1
    const error = new Error()
    const result = getResult(success, error)
    expect(result.isOk()).to.be.false
    expect(result.isError()).to.be.true
  })
})
