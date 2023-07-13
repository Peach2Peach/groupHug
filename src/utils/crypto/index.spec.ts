import { expect } from 'chai'
import { isDefined } from '../validation'
import * as cryptoUtils from './index'

describe('cryptoUtils', () => {
  it('all exports are defined', () => {
    expect(Object.values(cryptoUtils).every(isDefined)).to.equal(true)
  })
})
