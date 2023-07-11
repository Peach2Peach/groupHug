import { expect } from 'chai'
import { isDefined } from '../validation'
import * as systemUtils from './index'

describe('systemUtils', () => {
  it('all exports are defined', () => {
    expect(Object.values(systemUtils).every(isDefined)).to.equal(true)
  })
})
