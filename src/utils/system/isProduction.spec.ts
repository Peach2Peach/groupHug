import { ok } from 'assert'
import { bitcoin, regtest, testnet } from 'bitcoinjs-lib/src/networks'
import { describe, it } from 'mocha'
import { isProduction } from '.'
import Sinon from 'sinon'
import * as constants from '../../../constants'
import { expect } from 'chai'

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
