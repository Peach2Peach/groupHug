import { expect } from 'chai'
import { isDefined } from '../validation'
import * as batchUtils from './index'

describe('batchUtils', () => {
  it('all exports are defined', () => {
    expect(Object.values(batchUtils).every(isDefined)).to.equal(true)
  })
})
