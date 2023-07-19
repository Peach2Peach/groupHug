import { expect } from 'chai'
import blockExplorerData from '../../../test/data/blockExplorerData.json'
import { sumUTXOValues } from './sumUTXOValues'

describe('sumUTXOValues', () => {
  it('returns the sum of the values of utxo', () => {
    expect(sumUTXOValues(blockExplorerData.utxo)).to.equal(1000000000)
    expect(
      sumUTXOValues([...blockExplorerData.utxo, ...blockExplorerData.utxo]),
    ).to.equal(2000000000)
  })
})
