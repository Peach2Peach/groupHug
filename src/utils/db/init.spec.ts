import { describe, it } from 'mocha'
import { initDatabase } from '.'

describe('init', () => {
  it('initialise the database connection', () => {
    initDatabase({ database: 9 })
  })
})
