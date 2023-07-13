import { describe, it } from 'mocha'
import { traverse } from '.'
import { expect } from 'chai'

describe('traverse', () => {
  it('matches a buyOffer with a sellOffer', () => {
    const object = {
      user: { id: 1 },
      value: 'A',
    }

    expect(traverse(object, 'value')).to.equal('A')
    expect(traverse(object, 'user')).to.deep.equal({ id: 1 })
    expect(traverse(object, 'user.id')).to.equal(1)
    expect(traverse(object, 'user.ghost')).to.equal(null)
    expect(traverse(object, 'ghost')).to.equal(null)
    expect(traverse(object, 'ghost.id')).to.equal(null)
  })
})
