import { dbLogger } from "./dbLogger";

export const errorListener = (err: Error) =>
  dbLogger.error(["Redis Client Error", err]);
