import { Request, Response } from "express";
import { respondWithError } from "../src/utils/response";
import { decrypted } from "../src/utils/system/decryptConfig";

export const passwordProtection = (
  req: Request,
  res: Response,
  next: Function,
) => {
  if (decrypted || req.url === "/v1/start") {
    return next();
  }
  return respondWithError(res, "SERVICE_UNAVAILABLE");
};
