import { deepStrictEqual } from 'assert'
import { describe, it } from 'mocha'
import { unique } from './unique'

describe('unique', () => {
  it('filters array items by unique values', () => {
    const flatArray = [1, 1, 2, 1, 3, 4]
    const flatArrayAlpha = ['a', 'a', 'b', 'a', 'c', 'd']
    const object1A = {
      user: { id: 1 },
      value: 'A',
    }
    const object1D = {
      user: { id: 1 },
      value: 'D',
    }
    const object2B = {
      user: { id: 2 },
      value: 'B',
    }
    const object3A = {
      user: { id: 3 },
      value: 'A',
    }
    const objectArray = [object1A, object2B, object1A, object1D, object3A]
    deepStrictEqual(flatArray.filter(unique()), [1, 2, 3, 4])
    deepStrictEqual(flatArrayAlpha.filter(unique()), ['a', 'b', 'c', 'd'])
    deepStrictEqual(objectArray.filter(unique('value')), [object1A, object2B, object1D])
    deepStrictEqual(objectArray.filter(unique('user.id')), [object1A, object2B, object3A])
  })
})
