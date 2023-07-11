import { expect } from 'chai'
import { isDefined } from '../validation'
import * as validationUtils from './index'

describe('validationUtils', () => {
  it('all exports are defined', () => {
    expect(Object.values(validationUtils).every(isDefined)).to.equal(true)
  })
})
