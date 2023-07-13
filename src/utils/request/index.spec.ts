import { expect } from 'chai'
import { isDefined } from '../validation'
import * as requestUtils from './index'

describe('requestUtils', () => {
  it('all exports are defined', () => {
    expect(Object.values(requestUtils).every(isDefined)).to.equal(true)
  })
})
