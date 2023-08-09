import { expect } from 'chai'
import { getFeeRanges } from './getFeeRanges'
import { getSteps } from './getSteps'

describe('getSteps', () => {
  it('should divide a value into a given amount of steps', () => {
    expect(getFeeRanges(getSteps(100, 10))).to.deep.equal([
      [1, 12],
      [12, 23],
      [23, 34],
      [34, 45],
      [45, 56],
      [56, 67],
      [67, 78],
      [78, 89],
      [89, 100],
      [100, undefined],
    ])
    expect(getFeeRanges(getSteps(63, 10))).to.deep.equal([
      [1, 7],
      [7, 14],
      [14, 21],
      [21, 28],
      [28, 35],
      [35, 42],
      [42, 49],
      [49, 56],
      [56, 63],
      [63, undefined],
    ])
  })
})
