/* eslint-disable max-lines */
import { createClient } from 'redis'

export class SubClient {
  client: ReturnType<typeof createClient>
  multi: any

  constructor (isolatedClient: ReturnType<typeof createClient>, multi: any) {
    this.client = isolatedClient
    this.multi = multi
  }

  /**
   * @description Method to store values in database
   * @param key the key of element
   * @param val the value of element
   * @param [expiration] expiration time in mili seconds
   * @returns Promise resolving set status
   */
  async set (key: string, val: any, expiration?: number): Promise<any> {
    await this.client.watch(key)
    await this.multi.set(key, String(val))
    if (expiration) {
      await this.multi.pExpire(key, expiration)
    }
  }

  /**
   * @description Method to increment a value in database
   * @param key the key of element
   * @returns Promise resolving increment status
   */
  async incr (key: string): Promise<any> {
    await this.client.watch(key)
    await this.multi.incr(key)
  }

  /**
   * @description Method to increment the score of a value in a sorted set
   * @param key the key of element
   * @param amount amount to incr the score
   * @param value the value to affect
   */
  async zincrby (key: string, amount: number, value: string): Promise<any> {
    await this.client.watch(key)
    await this.multi.zIncrBy(key, amount, value)
  }

  /**
   * @description Method to increment the value of a field in database
   * @param key the key of element
   * @param field the name of the field
   * @param value the increment amount
   * @returns Promise resolving increment status
   */
  async hincrby (key: string, field: string, value = 1): Promise<any> {
    await this.client.watch(key)
    await this.multi.hIncrBy(key, field, value)
  }

  /**
   * @description Method to store values in database
   * @param key the key of element
   * @param vals the values of element
   * @param [expiration] expiration time in mili seconds
   * @returns Promise resolving hset status
   */
  async hset (key: string, vals: AnyObject, expiration?: number): Promise<any> {
    await this.client.watch(key)

    const cleanedVals = Object.keys(vals)
      .filter((k) => typeof vals[k] !== 'undefined' && vals[k] !== null)
      .reduce((obj, k) => {
        obj[k] = String(vals[k])
        return obj
      }, {} as Record<string, string>)

    await this.multi.hSet(key, cleanedVals)
    if (expiration) {
      await this.multi.pExpire(key, expiration)
    }
  }

  /**
   * @description Method to delete values from a hash set in database
   * @param key the key of element
   * @param field the field name of element
   * @returns Promise resolving hdel status
   */
  async hdel (key: string, field: string): Promise<any> {
    await this.client.watch(key)
    await this.multi.addCommand(['HDEL', key, field])
  }

  /**
   * @description Method to delete values from a hash set in database
   * @param key the key of element
   * @param field the field name of element
   * @returns Promise resolving hdel status
   */
  async hget (key: string, field: string): Promise<any> {
    await this.client.watch(key)
    return this.client.hGet(key, field)
  }

  async sadd (key: string, val: string | string[]): Promise<any> {
    await this.client.watch(key)
    await this.multi.sAdd(key, val)
  }

  async srem (key: string, val: string | string[]): Promise<any> {
    await this.client.watch(key)
    await this.multi.sRem(key, val)
  }

  /**
   * @description Method to store add members to a list in database
   * @param key the key of element
   * @param val the value to add
   * @returns Promise resolving to add status
   */
  async rpush (key: string, val: string): Promise<any> {
    await this.client.watch(key)
    await this.multi.rPush(key, val)
  }

  /**
   * @description Method to store add members to set in database
   * @param theKeys the key of element
   * @param val the value to add
   * @returns Promise resolving to removal status
   */
  async sunionstore (newKey: string, theKeys: string[], expiration?: number): Promise<any> {
    await this.client.watch(newKey)
    await this.multi.sUnionStore(newKey, theKeys)
    if (expiration) {
      await this.multi.pExpire(newKey, expiration)
    }
  }

  /**
   * @description Method to add members to sorted set in database
   * @param key the key of element
   * @param score the score of the entry
   * @param value the value to add
   * @returns Promise resolving to add status
   */
  async zadd (key: string, score: number, value: string): Promise<any> {
    await this.client.watch(key)
    await this.multi.zAdd(key, {
      value,
      score,
    })
  }

  /**
   * @description Method to remove members from sorted set in database
   * @param key the key of element
   * @param val the value to remove
   * @returns Promise resolving to remov status
   */
  async zrem (key: string, val: string): Promise<any> {
    await this.client.watch(key)
    await this.multi.zRem(key, val)
  }

  /**
   * @description Method to remove members from sorted that score the lowest
   * @param key the key of element
   * @param count the amount of elements to pop
   * @returns Promise resolving the pop status
   */
  async zpopmin (key: string, count = 1): Promise<any> {
    await this.client.watch(key)
    await this.multi.zPopMinCount(key, count)
  }

  /**
   * @description Method to get intersection of multiple sorted sets
   * @param destination the destination
   * @param keys the keys of the lists
   * @param [aggregate] score aggregation strategy (default: MIN)
   * @returns Promise resolving to intersection of multiple sorted sets
   */
  async zinterstore (destination: string, keys: string[], aggregate?: 'MIN' | 'MAX' | 'SUM'): Promise<number> {
    await this.client.watch(destination)

    return await this.multi.zInterStore(destination, keys, {
      AGGREGATE: aggregate ? aggregate : undefined,
    })
  }

  /**
   * @description Method to calculate the difference between the first and
   * all successive input sorted sets and stores the result
   * @param destination the destination of the result
   * @param keys the keys to calculate the diffrence from
   * @returns Promise resolving to number of elements in sorted set
   */
  async zdiffstore (destination: string, ...keys: string[]): Promise<any> {
    await this.multi.zDiffStore(destination, keys)
  }

  // eslint-disable-next-line max-params
  async zrangestore (
    destinationKey: string,
    key: string,
    start: number | '-inf' = '-inf',
    stop: number | '+inf' = '+inf',
    byScore = true,
    withScores = false,
  ): Promise<number> {
    return await this.multi.zRangeStore(destinationKey, key, String(start), String(stop), {
      BY: byScore ? 'SCORE' : undefined,
      WITHSCORES: withScores ? true : undefined,
    })
  }

  /**
   * @description Method to remove value in database
   * @param key the key of element
   * @returns Promise resolving deletion status
   */
  async del (key: string): Promise<any> {
    await this.client.watch(key)
    await this.multi.del(key)
  }

  /**
   * @description Method to create a new set based on a range and another set
   * @param destinationKey where to store the entries
   * @param keys the key to apply the range on (source of data)
   * @returns Promise resolving to range in list elements
   */
  // eslint-disable-next-line max-params
  async zunionstore (destinationKey: string, keys: string[]): Promise<number> {
    return await this.multi.zUnionStore(destinationKey, keys)
  }
}
