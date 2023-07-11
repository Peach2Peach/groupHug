import { expect } from 'chai'
import Sinon from 'sinon'
import * as constants from '../../../constants'
import { getDefaultLevel } from './getDefaultLevel'

describe('getDefaultLevel', () => {
  after(() => {
    Sinon.restore()
  })
  it('should return info for non production environments', () => {
    Sinon.stub(constants, 'NODE_ENV').get(() => 'development')

    expect(getDefaultLevel()).to.equal('info')
  })
  it('should return warn for  production environments', () => {
    Sinon.stub(constants, 'NODE_ENV').get(() => 'production')

    expect(getDefaultLevel()).to.equal('warn')
  })
})
