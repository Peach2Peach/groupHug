import { expect } from 'chai'
import { getSteps } from './getSteps'
import { getFeeRanges } from './getFeeRanges'

describe('getSteps', () => {
  it('should divide a value into a given amount of steps', () => {
    expect(getFeeRanges(getSteps(100, 10))).to.deep.equal([
      [1, 10],
      [10, 20],
      [20, 30],
      [30, 40],
      [40, 50],
      [50, 60],
      [60, 70],
      [70, 80],
      [80, 90],
      [90, 100],
      [100, undefined],
    ])
    expect(getFeeRanges(getSteps(63, 10))).to.deep.equal([
      [1, 7],
      [7, 13],
      [13, 19],
      [19, 26],
      [26, 32],
      [32, 38],
      [38, 45],
      [45, 51],
      [51, 57],
      [57, 63],
      [63, undefined],
    ])
  })
})
