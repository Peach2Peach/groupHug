import { expect } from 'chai'
import { isDefined } from '../validation'
import * as dbUtils from './index'

describe('dbUtils', () => {
  it('all exports are defined', () => {
    expect(Object.values(dbUtils).every(isDefined)).to.equal(true)
  })
})
