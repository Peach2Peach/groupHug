import { NextFunction, Request, Response } from "express";
import { respondWithError } from "../../../src/utils/response";
import { SHA256Schema } from "../../../src/utils/validation/schemas";

export const validateGetBatchStatus = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id: idUnparsed } = req.query;

  try {
    if (idUnparsed === undefined) throw new Error("No id provided");
    SHA256Schema.parse(idUnparsed);

    return next();
  } catch (e) {
    return respondWithError(res, "BAD_REQUEST");
  }
};
