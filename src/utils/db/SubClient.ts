import { createClient } from 'redis'

export class SubClient {
  client: ReturnType<typeof createClient>
  multi: any

  constructor(isolatedClient: ReturnType<typeof createClient>, multi: any) {
    this.client = isolatedClient
    this.multi = multi
  }

  async set(key: string, val: any, expiration?: number): Promise<any> {
    await this.client.watch(key)
    await this.multi.set(key, String(val))
    if (expiration) {
      await this.multi.pExpire(key, expiration)
    }
  }

  async incr(key: string): Promise<any> {
    await this.client.watch(key)
    await this.multi.incr(key)
  }

  async zincrby(key: string, amount: number, value: string): Promise<any> {
    await this.client.watch(key)
    await this.multi.zIncrBy(key, amount, value)
  }

  async hincrby(key: string, field: string, value = 1): Promise<any> {
    await this.client.watch(key)
    await this.multi.hIncrBy(key, field, value)
  }

  async hset(key: string, vals: Record<string, any>, expiration?: number): Promise<any> {
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

  async hdel(key: string, field: string): Promise<any> {
    await this.client.watch(key)
    await this.multi.addCommand(['HDEL', key, field])
  }

  async hget(key: string, field: string): Promise<any> {
    await this.client.watch(key)
    return this.client.hGet(key, field)
  }

  async sadd(key: string, val: string | string[]): Promise<any> {
    await this.client.watch(key)
    await this.multi.sAdd(key, val)
  }

  async srem(key: string, val: string | string[]): Promise<any> {
    await this.client.watch(key)
    await this.multi.sRem(key, val)
  }

  async sunionstore(newKey: string, theKeys: string[], expiration?: number): Promise<any> {
    await this.client.watch(newKey)
    await this.multi.sUnionStore(newKey, theKeys)
    if (expiration) {
      await this.multi.pExpire(newKey, expiration)
    }
  }

  async zadd(key: string, score: number, value: string): Promise<any> {
    await this.client.watch(key)
    await this.multi.zAdd(key, {
      value,
      score,
    })
  }

  async zrem(key: string, val: string): Promise<any> {
    await this.client.watch(key)
    await this.multi.zRem(key, val)
  }

  async zpopmin(key: string, count = 1): Promise<any> {
    await this.client.watch(key)
    await this.multi.zPopMinCount(key, count)
  }

  async zinterstore(destination: string, keys: string[], aggregate?: 'MIN' | 'MAX' | 'SUM'): Promise<number> {
    await this.client.watch(destination)

    return this.multi.zInterStore(destination, keys, {
      AGGREGATE: aggregate ? aggregate : undefined,
    })
  }

  async zdiffstore(destination: string, ...keys: string[]): Promise<any> {
    await this.multi.zDiffStore(destination, keys)
  }

  // eslint-disable-next-line max-params
  zrangestore(
    destinationKey: string,
    key: string,
    start: number | '-inf' = '-inf',
    stop: number | '+inf' = '+inf',
    byScore = true,
  ): Promise<number> {
    return this.multi.zRangeStore(destinationKey, key, String(start), String(stop), {
      BY: byScore ? 'SCORE' : undefined,
    })
  }

  async del(key: string): Promise<any> {
    await this.client.watch(key)
    await this.multi.del(key)
  }

  zunionstore(destinationKey: string, keys: string[]): Promise<number> {
    return this.multi.zUnionStore(destinationKey, keys)
  }
}
