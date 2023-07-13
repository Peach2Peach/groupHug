import { expect } from 'chai'
import { isDefined } from '../validation'
import * as resultUtils from './index'

describe('resultUtils', () => {
  it('all exports are defined', () => {
    expect(Object.values(resultUtils).every(isDefined)).to.equal(true)
  })
})
