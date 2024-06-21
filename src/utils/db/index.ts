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

export const initDatabase = (opt?: RedisClientOptions) => {
  db = new DatabaseClient(getDefaultOptions(opt));
  return new Promise((resolve) => {
    db.client.on("ready", resolve);
  });
};

export const setClients = (dbClient: DatabaseClient) => {
  db = dbClient;
};

export const disconnectDatabases = async () => {
  await db.client.quit();
};
