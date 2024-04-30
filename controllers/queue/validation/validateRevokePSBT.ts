import { NextFunction, Request, Response } from "express";
import { db } from "../../../src/utils/db";
import { KEYS } from "../../../src/utils/db/keys";
import { respondWithError } from "../../../src/utils/response/respondWithError";
import {
  RevocationTokenSchema,
  SHA256Schema,
} from "../../../src/utils/validation/schemas";

export const validateRevokePSBT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id: idUnparsed, revocationToken: revocationTokenUnparsed } = req.body;

  try {
    const id = SHA256Schema.parse(idUnparsed);
    const revocationToken = RevocationTokenSchema.parse(
      revocationTokenUnparsed
    );

    const revocationTokenFromDB = await db.client.hGet(
      KEYS.PSBT.PREFIX + id,
      "revocationToken"
    );
    if (!revocationTokenFromDB) return respondWithError(res, "BAD_REQUEST");
    if (revocationTokenFromDB !== revocationToken)
      return respondWithError(res, "BAD_REQUEST");

    return next();
  } catch (e) {
    return respondWithError(res, "BAD_REQUEST");
  }
};
