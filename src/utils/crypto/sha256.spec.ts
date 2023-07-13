import { equal } from 'assert'
import { describe, it } from 'mocha'
import { sha256 } from '.'

describe('sha256', () => {
  it('should produce the expected hash', () => {
    const hash = sha256('dummyString')

    const expected =
      '37b0f902984de6eca6fcdc4a512680e4915f8d85d5295b2043ec4cafdc9d18b4'

    equal(hash, expected)
  })
})
