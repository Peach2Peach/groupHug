import { expect } from 'chai'
import { isDefined } from '../validation'
import * as jobUtils from './index'

describe('jobUtils', () => {
  it('all exports are defined', () => {
    expect(Object.values(jobUtils).every(isDefined)).to.equal(true)
  })
})
