import { expect } from 'chai'
import { isDefined } from '../validation'
import * as mathUtils from './index'

describe('mathUtils', () => {
  it('all exports are defined', () => {
    expect(Object.values(mathUtils).every(isDefined)).to.equal(true)
  })
})
