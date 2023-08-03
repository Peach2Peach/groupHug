import { describe, it } from 'mocha'
import { initDatabase } from '.'
import { DB_AUTH } from '../../../constants'

describe('init', () => {
  it('initialise the database connection', () => {
    initDatabase({ password: DB_AUTH, database: 9 })
  })
})
