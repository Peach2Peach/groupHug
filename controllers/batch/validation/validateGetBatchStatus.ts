import { NextFunction, Request, Response } from "express";
import { respondWithError } from "../../../src/utils/response";
import {
  FeeRateSchema,
  SHA256Schema,
} from "../../../src/utils/validation/schemas";

export const validateGetBatchStatus = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id: idUnparsed, feeRate: feeRateUnparsed } = req.query;

  try {
    if (feeRateUnparsed !== undefined)
      FeeRateSchema.parse(Number(feeRateUnparsed));
    if (idUnparsed) SHA256Schema.parse(idUnparsed);

    return next();
  } catch (e) {
    return respondWithError(res, "BAD_REQUEST");
  }
};
