import { NextFunction, Request, Response } from "express";
import { getExtraPSBTDataById } from "../../../src/utils/queue";
import { respondWithError } from "../../../src/utils/response/respondWithError";
import {
  RevocationTokenSchema,
  SHA256Schema,
} from "../../../src/utils/validation/schemas";

export const validateRevokePSBT = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id: idUnparsed, revocationToken: revocationTokenUnparsed } = req.body;

  try {
    const id = SHA256Schema.parse(idUnparsed);
    const revocationToken = RevocationTokenSchema.parse(
      revocationTokenUnparsed,
    );

    const extraPSBTData = await getExtraPSBTDataById(id);
    if (!extraPSBTData) return respondWithError(res, "BAD_REQUEST");
    if (extraPSBTData.revocationToken !== revocationToken)
      return respondWithError(res, "BAD_REQUEST");

    return next();
  } catch (e) {
    return respondWithError(res, "BAD_REQUEST");
  }
};
