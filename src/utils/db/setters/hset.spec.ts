import { deepStrictEqual, strictEqual } from 'assert'
import { describe, it } from 'mocha'
import { db } from '..'
import { sleep } from '../../system'
import { complexVal, complexValWithFalseValues } from '../../../../test/data/primitiveData'

describe('hset', () => {
  it('should hset a value to database with expiration date', async () => {
    await db.transaction(async (client) => {
      await client.hset('expiring-hm-key', complexVal, 30)
    })
    deepStrictEqual(await db.hgetall('expiring-hm-key'), complexVal)
    await sleep(40)
    strictEqual(await db.get('expiring-hm-key'), null)
  })

  it('should set a object as hashmap to database', async () => {
    await db.transaction(async (client) => {
      await client.hset('test-hm-key', complexVal)
    })
    deepStrictEqual(await db.hgetall('test-hm-key'), complexVal)
  })

  it('should set a subkey of hashmap to database', async () => {
    await db.transaction(async (client) => {
      await client.hset('test-hm-key', complexVal)
      await client.hset('test-hm-key', {
        subKey2: 'overwritten-val',
      })
    })
    deepStrictEqual(await db.hmget('test-hm-key', ['subKey', 'subKey2', 'object.key']), [
      'test-val',
      'overwritten-val',
      'subkey val',
    ])
  })
  it('should set values to database that are also false or 0', async () => {
    await db.transaction(async (client) => {
      await client.hset('test-hm-key-false', complexValWithFalseValues)
    })

    deepStrictEqual(await db.hmget('test-hm-key-false', 'falseBoolean'), ['false'])
    deepStrictEqual(await db.hmget('test-hm-key-false', ['zeroValue']), ['0'])
  })
})
