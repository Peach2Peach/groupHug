import { createClient, RedisClientOptions } from "redis";
import { errorListener } from "./errorListener";
import { SubClient } from "./SubClient";

export class DatabaseClient {
  client: ReturnType<typeof createClient>;

  constructor(clientOptions: RedisClientOptions) {
    this.client = createClient(clientOptions);
    this.client.on("error", errorListener);

    void this.client.connect();
  }

  transaction<T>(func: (client: SubClient) => Promise<T>) {
    return this.client.executeIsolated(async (isolatedClient) => {
      const multi = isolatedClient.multi();
      try {
        const transactionResult = await func(
          new SubClient(isolatedClient, multi),
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
