import { expect } from 'chai'
import { isDefined } from '../validation'
import * as responseUtils from './index'

describe('responseUtils', () => {
  it('all exports are defined', () => {
    expect(Object.values(responseUtils).every(isDefined)).to.equal(true)
  })
})
