import { NextFunction, Request, Response } from "express";
import { cacheDB } from "../src/utils/db";

export const cache = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const key = req.originalUrl;
  const cachedResponse = await cacheDB.client.get(key);

  if (cachedResponse) {
    return res.send(JSON.parse(cachedResponse));
  }

  return next();
};
