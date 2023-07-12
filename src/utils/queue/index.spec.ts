import { expect } from 'chai'
import { isDefined } from '../validation'
import * as queueUtils from './index'

describe('queueUtils', () => {
  it('all exports are defined', () => {
    expect(Object.values(queueUtils).every(isDefined)).to.equal(true)
  })
})
