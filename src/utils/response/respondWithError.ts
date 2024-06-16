import { Response } from "express";
import { RESPONSE_CODES } from "../../../constants";

export const respondWithError = (
  res: Response,
  error: keyof typeof RESPONSE_CODES,
  details?: Record<string, string | number>,
) => res.status(RESPONSE_CODES[error]).json({ ...details, error });
