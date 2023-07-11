import { ok } from 'assert'
import { bitcoin, regtest, testnet } from 'bitcoinjs-lib/src/networks'
import { describe, it } from 'mocha'
import { isTestnet } from '.'

describe('isTestnet', () => {
  it('should be true', () => {
    ok(isTestnet(testnet))
  })
  it('should be false', () => {
    ok(!isTestnet(bitcoin))
    ok(!isTestnet(regtest))
  })
})
