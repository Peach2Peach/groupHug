import { NextFunction, Request, Response } from "express";
import { cacheDB } from "../src/utils/db";
import { KEYS } from "../src/utils/db/keys";

export const cache = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const cachedResponse = await cacheDB.client.get(
    KEYS.CACHE.PREFIX + req.originalUrl,
  );

  if (cachedResponse) {
    return res.send(JSON.parse(cachedResponse));
  }

  return next();
};
