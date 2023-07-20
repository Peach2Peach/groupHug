import { expect } from 'chai'
import { getFeeAddress } from './getFeeAddress'

describe('getFeeAddress', () => {
  it('returns fee address by given index', () => {
    expect(getFeeAddress(0)).to.equal(
      'bcrt1qcesq0ygge7lplef830reav07ukh6ngspc6h7pm',
    )
    expect(getFeeAddress(1)).to.equal(
      'bcrt1qupfa6jeus78n0ur28aun8fpm7aglj2a57em865',
    )
    expect(getFeeAddress(2)).to.equal(
      'bcrt1qkpwzl5hpxgl8eaatk3n40tl02fkr776xwz0aeg',
    )
  })
})
