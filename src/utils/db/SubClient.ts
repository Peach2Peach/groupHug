import { createClient } from "redis";

type Client = ReturnType<typeof createClient>;
type IsolatedClient = Parameters<Parameters<Client["executeIsolated"]>[0]>[0];
type Multi = ReturnType<IsolatedClient["multi"]>;
export class SubClient {
  client: Client;
  multi: Multi;

  constructor(isolatedClient: ReturnType<typeof createClient>, multi: Multi) {
    this.client = isolatedClient;
    this.multi = multi;
  }

  async set(key: string, val: unknown, expiration?: number) {
    await this.client.watch(key);
    this.multi.set(key, String(val));
    if (expiration) {
      this.multi.pExpire(key, expiration);
    }
  }

  async incr(key: string) {
    await this.client.watch(key);
    this.multi.incr(key);
  }

  async hset(key: string, vals: Record<string, unknown>, expiration?: number) {
    await this.client.watch(key);

    const cleanedVals = Object.keys(vals)
      .filter((k) => typeof vals[k] !== "undefined" && vals[k] !== null)
      .reduce(
        (obj, k) => {
          obj[k] = String(vals[k]);
          return obj;
        },
        {} as Record<string, string>,
      );

    this.multi.hSet(key, cleanedVals);
    if (expiration) {
      this.multi.pExpire(key, expiration);
    }
  }

  async hget(key: string, field: string) {
    await this.client.watch(key);
    return this.client.hGet(key, field);
  }

  async sadd(key: string, val: string | string[]) {
    await this.client.watch(key);
    this.multi.sAdd(key, val);
  }

  async srem(key: string, val: string | string[]) {
    await this.client.watch(key);
    this.multi.sRem(key, val);
  }

  async zadd(key: string, score: number, value: string) {
    await this.client.watch(key);
    this.multi.zAdd(key, {
      value,
      score,
    });
  }

  async zpopmin(key: string, count = 1) {
    await this.client.watch(key);
    this.multi.zPopMinCount(key, count);
  }

  async del(key: string) {
    await this.client.watch(key);
    this.multi.del(key);
  }
}
