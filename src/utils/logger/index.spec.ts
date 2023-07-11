import { expect } from 'chai'
import { isDefined } from '../validation'
import * as loggerUtils from './index'

describe('loggerUtils', () => {
  it('all exports are defined', () => {
    expect(Object.values(loggerUtils).every(isDefined)).to.equal(true)
  })
})
