import { Psbt } from "bitcoinjs-lib";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { MINIMUM_FEE_RATE, NETWORK, SIGHASH } from "../../../constants";
import { getServiceFees } from "../../../cronjobs/batchTransactions/getServiceFees";
import {
  finalize,
  signAllInputs,
  validatePSBTSignatures,
} from "../../../src/utils/psbt";
import { respondWithError } from "../../../src/utils/response/respondWithError";
import { getSignerByIndex } from "../../../src/wallets/getSignerByIndex";
import { hotWallet, oldHotWallet } from "../../../src/wallets/hotWallet";

export const validatePSBT = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { psbt: base64Unparsed, index: indexUnparsed } = req.body;

  try {
    const base64 = z.string().nonempty().parse(base64Unparsed);
    const index = indexUnparsed
      ? z.number().gte(0).parse(indexUnparsed)
      : undefined;
    const psbt = Psbt.fromBase64(base64, { network: NETWORK });
    if (psbt.txInputs.length !== 1)
      return respondWithError(res, "BAD_REQUEST", {
        details: "INVALID_INPUTS",
      });
    if (psbt.txOutputs.length !== 1)
      return respondWithError(res, "BAD_REQUEST", {
        details: "INVALID_OUTPUTS",
      });
    if (!validatePSBTSignatures(psbt))
      return respondWithError(res, "BAD_REQUEST", {
        details: "SIGNATURE_INVALID",
      });
    if (
      psbt.data.inputs.some(
        (input) => input.sighashType !== SIGHASH.SINGLE_ANYONECANPAY,
      )
    ) {
      return respondWithError(res, "BAD_REQUEST", { details: "WRONG_SIGHASH" });
    }

    if (index !== undefined) {
      signAllInputs(
        psbt,
        getSignerByIndex(hotWallet, index, NETWORK),
        getSignerByIndex(oldHotWallet, index, NETWORK),
      );
    }

    finalize(psbt);
    const feeRate = psbt.getFeeRate();
    if (feeRate < MINIMUM_FEE_RATE) {
      return respondWithError(res, "BAD_REQUEST", {
        details: "INVALID_FEE_RATE",
        feeRate,
        finalFeeRate: feeRate,
      });
    }
    const serviceFees = getServiceFees([psbt]);
    const miningFees = psbt.getFee() - serviceFees;
    if (miningFees <= 0) {
      return respondWithError(res, "BAD_REQUEST", {
        details: "INVALID_SERVICE_FEES",
        miningFees,
      });
    }
    return next();
  } catch (e) {
    return respondWithError(res, "BAD_REQUEST", { details: "" });
  }
};
