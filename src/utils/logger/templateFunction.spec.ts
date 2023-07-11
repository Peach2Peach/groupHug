import { expect } from 'chai'
import { TransformableInfo } from 'logform'
import { templateFunction } from './templateFunction'

describe('templateFunction', () => {
  it('should return the formatted log message with stack if available', () => {
    const log: TransformableInfo = {
      level: 'info',
      label: 'Bitcoin',
      timestamp: '2023-07-11 12:34:56',
      message: 'New transaction detected',
      stack: 'Error: Insufficient funds\n    at processTransaction (wallet.js:123)',
    }

    const result = templateFunction(log)

    const expected =
      // eslint-disable-next-line max-len
      'info: Bitcoin: 2023-07-11 12:34:56: New transaction detected\nError: Insufficient funds\n    at processTransaction (wallet.js:123)'
    expect(result).to.equal(expected)
  })
  it('should return the formatted log message without stack if not available', () => {
    const log: TransformableInfo = {
      level: 'debug',
      label: 'Bitcoin',
      timestamp: '2023-07-11 12:34:56',
      message: 'Block mined successfully',
    }

    const result = templateFunction(log)

    const expected = 'debug: Bitcoin: 2023-07-11 12:34:56: Block mined successfully'
    expect(result).to.equal(expected)
  })
})
