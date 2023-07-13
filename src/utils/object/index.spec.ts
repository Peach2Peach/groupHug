import { expect } from 'chai'
import { isDefined } from '../validation'
import * as arrayUtils from './index'

describe('arrayUtils', () => {
  it('all exports are defined', () => {
    expect(Object.values(arrayUtils).every(isDefined)).to.equal(true)
  })
})
