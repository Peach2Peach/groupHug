import { strictEqual, deepStrictEqual } from 'assert'
import { describe, it } from 'mocha'
import { traverse } from '.'

describe('traverse', () => {
  it('matches a buyOffer with a sellOffer', () => {
    const object = {
      user: { id: 1 },
      value: 'A',
    }

    strictEqual(traverse(object, 'value'), 'A')
    deepStrictEqual(traverse(object, 'user'), { id: 1 })
    strictEqual(traverse(object, 'user.id'), 1)
    strictEqual(traverse(object, 'user.ghost'), null)
    strictEqual(traverse(object, 'ghost'), null)
    strictEqual(traverse(object, 'ghost.id'), null)
  })
})
