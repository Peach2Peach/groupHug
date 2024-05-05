import { createClient, RedisClientOptions } from "redis";
import { getDefaultOptions } from ".";
import { isDefined } from "../validation";
import { errorListener } from "./errorListener";
import { SubClient } from "./SubClient";

export class DatabaseClient {
  client: ReturnType<typeof createClient>;

  constructor(clientOptions: Partial<RedisClientOptions>) {
    this.client = createClient({ ...getDefaultOptions(), ...clientOptions });
    this.client.on("error", errorListener);

    void this.client.connect();
  }

  async quit(): Promise<void> {
    await this.client.quit();
  }

  keys(pattern: string) {
    return this.client.keys(pattern);
  }
  async exists(key: string) {
    return (await this.client.exists(key)) === 1;
  }

  get(key: string) {
    return this.client.get(key);
  }

  hmget(key: string, subkey: string | string[]) {
    return this.client.hmGet(key, subkey);
  }

  incr(key: string) {
    return this.client.incr(key);
  }

  scard(key: string) {
    return this.client.sCard(key);
  }

  smembers(key: string) {
    return this.client.sMembers(key);
  }

  spop(key: string, count = 1) {
    return this.client.sPop(key, count);
  }

  sismember(key: string, value: string) {
    return this.client.sIsMember(key, value);
  }

  sinter(theKeys: string[]) {
    return this.client.sInter(theKeys);
  }

  sunion(theKeys: string[]) {
    return this.client.sUnion(theKeys);
  }

  // eslint-disable-next-line max-params
  zrange(
    key: string,
    start: number | "-inf" = "-inf",
    stop: number | "+inf" = "+inf",
    byScore = true,
    rev: boolean = false,
    offset: number | undefined = undefined,
    count: number | undefined = undefined
  ) {
    return this.client.zRange(
      key,
      String(rev && byScore ? stop : start),
      String(rev && byScore ? start : stop),
      {
        BY: byScore ? "SCORE" : undefined,
        LIMIT: count && isDefined(offset) ? { offset, count } : undefined,
        REV: rev ? true : undefined,
      }
    );
  }

  // eslint-disable-next-line max-params
  zrangewithscores(
    key: string,
    start: number | "-inf" = "-inf",
    stop: number | "+inf" = "+inf",
    byScore = true,
    rev = false
  ) {
    return this.client.zRangeWithScores(
      key,
      String(rev && byScore ? stop : start),
      String(rev && byScore ? start : stop),
      {
        BY: byScore ? "SCORE" : undefined,
        REV: rev ? true : undefined,
      }
    );
  }
  zinter(keys: string[]) {
    return this.client.zInter(keys);
  }

  zcount(
    key: string,
    start: number | "-inf" = "-inf",
    stop: number | "+inf" = "+inf"
  ) {
    return this.client.zCount(key, String(start), String(stop));
  }

  zincrby(key: string, amount: number, value: string) {
    return this.client.zIncrBy(key, amount, value);
  }

  zcard(key: string) {
    return this.client.ZCARD(key);
  }

  async zpopmin(key: string): Promise<string | undefined> {
    const item = await this.client.ZPOPMIN(key);
    if (!item) return;
    return item.value;
  }

  async hgetall(key: string): Promise<Record<string, string> | null> {
    const response = await this.client.hGetAll(key);

    if (!response || Object.keys(response).length === 0) return null;
    return { ...response };
  }

  hdel(key: string, field: string) {
    return this.client.hDel(key, field);
  }

  zscore(key: string, element: string): Promise<number | null> {
    return this.client.zScore(key, element);
  }

  transaction<T>(func: (client: SubClient) => Promise<T>) {
    return this.client.executeIsolated(async (isolatedClient) => {
      const multi = isolatedClient.multi();
      try {
        const transactionResult = await func(
          new SubClient(isolatedClient, multi)
        );
        await multi.exec();

        return {
          ok: true as const,
          result: transactionResult,
          error: undefined,
        };
      } catch (e) {
        multi.discard();
        return {
          ok: false as const,
          result: undefined,
          error: "transaction aborted",
        };
      }
    });
  }
}
