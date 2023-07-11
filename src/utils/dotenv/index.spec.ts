import { expect } from 'chai'
import { isDefined } from '../validation'
import * as dotenvUtils from './index'

describe('dotenvUtils', () => {
  it('all exports are defined', () => {
    expect(Object.values(dotenvUtils).every(isDefined)).to.equal(true)
  })
})
