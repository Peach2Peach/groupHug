import { expect } from 'chai'
import { getSteps } from './getSteps'

describe('getSteps', () => {
  it('should divide a value into a given amount of steps', () => {
    expect(getSteps(100, 10)).to.deep.equal([
      10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
    ])
    expect(getSteps(63, 10)).to.deep.equal([
      7, 13, 19, 26, 32, 38, 45, 51, 57, 63,
    ])
  })
})
