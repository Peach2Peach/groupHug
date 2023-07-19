import { expect } from 'chai'
import { describe, it } from 'mocha'
import Sinon from 'sinon'
import { isProduction } from '.'
import * as constants from '../../../constants'

describe('isProduction', () => {
  afterEach(() => {
    Sinon.restore()
  })
  it('should be true if NODE_ENV is production', () => {
    Sinon.stub(constants, 'NODE_ENV').get(() => 'production')
    expect(isProduction()).to.be.true
  })
  it('should be true if NODE_ENV is not production', () => {
    Sinon.stub(constants, 'NODE_ENV').get(() => 'development')
    expect(isProduction()).to.be.false
  })
})
