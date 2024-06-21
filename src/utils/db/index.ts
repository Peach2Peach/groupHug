import { RedisClientOptions } from "redis";
import { DB_AUTH, DB_HOST, DB_PORT } from "../../../constants";
import { DatabaseClient } from "./DatabaseClient";

export const getDefaultOptions = (opt = {}): RedisClientOptions => ({
  url: `redis://${DB_HOST}:${DB_PORT}`,
  password: DB_AUTH,
  database: 0,
  ...opt,
});

export let db: DatabaseClient;
export let cacheDB: DatabaseClient;
const dbCount = 2;

export const initDatabase = (opt?: RedisClientOptions) => {
  db = new DatabaseClient(getDefaultOptions(opt));
  cacheDB = new DatabaseClient(getDefaultOptions({ database: 1, ...opt }));

  return new Promise<void>((resolve) => {
    let readyCount = 0;
    const resolveIfReady = () => {
      readyCount++;
      if (readyCount === dbCount) resolve();
    };
    db.client.on("ready", resolveIfReady);
    cacheDB.client.on("ready", resolveIfReady);
  });
};

export const setClients = (dbClient: DatabaseClient) => {
  db = dbClient;
};

export const disconnectDatabases = async () => {
  await db.client.quit();
};
