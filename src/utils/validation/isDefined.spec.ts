import { ok } from 'assert'
import { describe, it } from 'mocha'
import { isDefined } from '.'

describe('isDefined', () => {
  it('validates that value is defined', () => {
    ok(isDefined(1))
    ok(isDefined(0))
    ok(isDefined(Infinity))
    ok(isDefined({}))
    ok(isDefined([]))
    ok(isDefined([1]))
    ok(isDefined('CHF'))
    ok(!isDefined(null))
    ok(!isDefined(undefined))
  })
})
