/* eslint-disable max-lines */
import { createClient, RedisClientOptions } from 'redis'
import { getDefaultOptions } from '.'
import getLogger from '../logger'
import { SubClient } from './SubClient'
import { TransactionResult } from './TransactionResult'
const logger = getLogger('utils', 'db')

type TransactionFunction = (client: SubClient) => Promise<boolean | void>
export class DatabaseClient {
  client: ReturnType<typeof createClient>

  constructor (clientOptions?: Partial<RedisClientOptions>) {
    if (clientOptions) {
      this.client = createClient({ ...getDefaultOptions(), ...clientOptions })
      this.client.on('error', (err) => logger.error(['Redis Client Error', err]))
    }

    this.client.connect()
  }

  async quit (): Promise<void> {
    await this.client.quit()
  }

  /**
   * @description Method to get list of keys in database
   * @param pattern key pattern
   * @returns Promise resolving to keys present
   */
  async keys (pattern: string): Promise<string[]> {
    return await this.client.keys(pattern)
  }

  /**
   * @description Method to check if a key exists in the database
   * @param pattern key
   */
  async exists (key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1
  }

  /**
   * @description Method to get value in database
   * @param key the key of element
   * @returns Promise resolving to retrieved value
   */
  async get (key: string): Promise<string> {
    return await this.client.get(key)
  }

  /**
   * @description Method to get values in database
   * @param key the keys of elements
   * @returns Promise resolving to retrieved value
   */
  async mget (key: string[]): Promise<string[]> {
    return await this.client.mGet(key)
  }

  /**
   * @description Method to get value from hashmap in database
   * @param key the category of element
   * @param subkey the key of element
   * @returns Promise resolving to retrieved value
   */
  async hmget (key: string, subkey: string | string[]): Promise<string[]> {
    return await this.client.hmGet(key, subkey)
  }

  /**
   * @description Method to get count of members of set in database
   * @param key the key of element
   * @returns Promise resolving to count of members
   */
  async scard (key: string): Promise<number> {
    return await this.client.sCard(key)
  }

  /**
   * @description Method to get members of set in database
   * @param key the key of element
   * @returns Promise resolving to array of set members
   */
  async smembers (key: string): Promise<string[]> {
    return await this.client.sMembers(key)
  }

  /**
   * @description Method to get random member of set in database
   * @param key the key of element
   * @returns Promise resolving random member
   */
  async srandmember (key: string): Promise<string> {
    return await this.client.sRandMember(key)
  }

  /**
   * @description Method to get and remove random member from set in database
   * @param key the key of element
   * @param count number of members to pop
   * @returns Promise resolving random members
   */
  async spop (key: string, count = 1): Promise<string[]> {
    return await this.client.sPop(key, count)
  }

  /**
   * @description Method to check if a given value is member of a set
   * @param key the key of element
   * @param value the value to check
   * @returns Promise resolving to true or false
   */
  async sismember (key: string, value: string): Promise<boolean> {
    return await this.client.sIsMember(key, value)
  }

  /**
   * @description Method to get intersections of sets
   * @param theKeys the theKeys of elements to intersect
   * @returns Promise resolving to intersecting elements
   */
  async sinter (theKeys: string[]): Promise<string[]> {
    return await this.client.sInter(theKeys)
  }

  /**
   * @description Method to get count of members of set in database
   * @param key the key of element
   * @returns Promise resolving to count of members
   */
  async sintercard (keys: string[]): Promise<number> {
    return await this.client.sInterCard(keys)
  }

  /**
   * @description Method to get union of sets
   * @param theKeys the theKeys of elements to unionise
   * @returns Promise resolving to unionised elements
   */
  async sunion (theKeys: string[]): Promise<string[]> {
    return await this.client.sUnion(theKeys)
  }

  /**
   * @description Method to get range of list
   * @param key the keys of the list
   * @param start index to start art
   * @param stop index to stop at
   * @returns Promise resolving to range in list elements
   */
  async lrange (key: string, start: number, stop: number): Promise<string[]> {
    return await this.client.lRange(key, start, stop)
  }

  /**
   * @description Method to get range of list
   * @param key the keys of the list
   * @param start index to start art
   * @param stop index to stop at
   * @param byScore if true, get range by score
   * @returns Promise resolving to range in list elements
   */
  // eslint-disable-next-line max-params
  async zrange (
    key: string,
    start: number | '-inf' = '-inf',
    stop: number | '+inf' = '+inf',
    byScore = true,
    rev: boolean = false,
    offset: number = undefined,
    count: number = undefined,
  ): Promise<string[]> {
    return await this.client.zRange(key, String(rev && byScore ? stop : start), String(rev && byScore ? start : stop), {
      BY: byScore ? 'SCORE' : undefined,
      LIMIT: count ? { offset, count } : undefined,
      REV: rev ? true : undefined,
    })
  }

  // eslint-disable-next-line max-params
  async zrangewithscores (
    key: string,
    start: number | '-inf' = '-inf',
    stop: number | '+inf' = '+inf',
    byScore = true,
    rev = false,
  ) {
    return await this.client.zRangeWithScores(
      key,
      String(rev && byScore ? stop : start),
      String(rev && byScore ? start : stop),
      {
        BY: byScore ? 'SCORE' : undefined,
        REV: rev ? true : undefined,
      },
    )
  }

  /**
   * @description Method to intersect sorted sets
   * @param keys the keys to intersect
   * @returns Promise resolving to a list of elements that exist in all intersected sets
   */
  async zinter (keys: string[]): Promise<string[]> {
    return await this.client.zInter(keys)
  }

  /**
   * @description Method to get range of list reversed
   * @param key the keys of the list
   * @param start index to start art
   * @param stop index to stop at
   * @param byScore if true, get range by score
   * @returns Promise resolving to range in list elements
   */
  async zrevrange (
    key: string,
    start: number | '-inf' = '-inf',
    stop: number | '+inf' = '+inf',
    byScore = true,
  ): Promise<string[]> {
    return await this.client.zRange(key, String(start), String(stop), {
      BY: byScore ? 'SCORE' : undefined,
      REV: true,
    })
  }

  /**
   * @description Method to count items in sorted set. Can be restricted by range
   * @param key the keys of the list
   * @param start index to start art
   * @param stop index to stop at
   * @returns Promise resolving to number of elements in sorted set
   */
  async zcount (key: string, start: number | '-inf' = '-inf', stop: number | '+inf' = '+inf'): Promise<number> {
    return await this.client.zCount(key, String(start), String(stop))
  }

  /**
   * @description Method to increment the score of a value in a sorted set
   * @param key the key of element
   * @param amount amount to incr the score
   * @param value the value to affect
   */
  async zincrby (key: string, amount: number, value: string): Promise<any> {
    return await this.client.zIncrBy(key, amount, value)
  }

  /**
   * @description Method to count items in sorted set
   * @param key the keys of the list
   * @returns Promise resolving to number of elements in sorted set
   */
  async zcard (key: string): Promise<number> {
    return await this.client.ZCARD(key)
  }

  async zpopmin (key: string): Promise<string | undefined> {
    const item = await this.client.ZPOPMIN(key)
    if (!item) return
    return item.value
  }

  /**
   * @description Method to get whole object of hashmap in database
   * @param key the category of element
   * @returns Promise resolving to retrieved value
   */
  async hgetall (key: string): Promise<Record<string, string> | null> {
    const response = await this.client.hGetAll(key)

    if (!response || Object.keys(response).length === 0) return null
    return { ...response }
  }

  /**
   * @description Method to check if a field exists in the given key
   * @param key the key to search
   * @param value the field to check existence
   * @returns Promise resolving the result
   */
  async hexists (key: string, value: string): Promise<boolean> {
    return await this.client.hExists(key, value)
  }

  /**
   * @description Method to get and remove random member from set in database
   * @param key the key of element
   * @param count number of members to pop
   * @returns Promise resolving random members
   */
  async lpop (key: string, count = 1): Promise<string[]> {
    return await this.client.lPopCount(key, count)
  }

  /**
   * @description Method to get and remove random member from set in database
   * @param key the key of element
   * @param count number of members to pop
   * @returns Promise resolving random members
   */
  async rpush (key: string, value: string): Promise<number> {
    return await this.client.rPush(key, value)
  }

  /**
   * @description Method to remove a field from element in database
   * @param key the key of element
   * @param field the name of the field
   * @returns Promise resolving the number of deleted fields
   */
  async hdel (key: string, field: string): Promise<number> {
    return await this.client.hDel(key, field)
  }

  /**
   * @description Method to get the score of a member in a sorted set
   * @param key the key of element
   * @param element the element to retrieve the score from
   * @returns Promise resolving the score of the element in the set, null if the member is not present
   */
  async zscore (key: string, element: string): Promise<number | null> {
    return await this.client.zScore(key, element)
  }

  /**
   * @description Method to wrap transactional database operations to execute them either all or none
   * @param func wrapped function containing db operations - to fail whoel transaction, return false
   * @example
   * await db.transaction(async (client) => {
   *   await client.set('test-key', 'test-val')
   * })
   */
  transaction (func: TransactionFunction): Promise<TransactionResult> {
    return new Promise((resolve, reject) =>
      this.client.executeIsolated(async (isolatedClient) => {
        const multi = isolatedClient.multi()
        let transactionResult
        try {
          transactionResult = await func(new SubClient(isolatedClient, multi))
        } catch (e) {
          multi.discard()
          reject(e)
          return
        }

        if (transactionResult === false) {
          multi.discard()
          return resolve(new TransactionResult(false, undefined, 'transaction aborted'))
        }

        const results = await multi.exec()
        if (!results) {
          logger.error('Optimistic locking failure')
          return resolve(await this.transaction(func))
        }
        return resolve(new TransactionResult(true, results))
      }),
    )
  }
}
