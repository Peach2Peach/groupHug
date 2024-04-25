import { Psbt } from "bitcoinjs-lib";
import { NETWORK } from "../../constants";
import { getTx } from "../../src/utils/electrs";
import { getTxIdOfInput } from "../../src/utils/psbt";
import { addPSBTToQueue } from "../../src/utils/queue";
import { respondWithError } from "../../src/utils/response";
import { isDefined } from "../../src/utils/validation";
import { AddPSBTRequest, AddPSBTResponse } from "./types";

export const addPSBTController = async (
  req: AddPSBTRequest,
  res: AddPSBTResponse
) => {
  const { psbt: base64, feeRate, index } = req.body;

  const psbt = Psbt.fromBase64(base64, { network: NETWORK });

  const results = await Promise.all(
    psbt.txInputs.map((input) => getTx(getTxIdOfInput(input)))
  );
  const transactions = results.map((result) => result.getValue());
  if (
    transactions.every(isDefined) &&
    transactions.some((tx) => !tx.status.confirmed)
  ) {
    return respondWithError(res, "BAD_REQUEST");
  }

  const result = await addPSBTToQueue(psbt, feeRate, index);
  if (result.isError()) return respondWithError(res, "INTERNAL_SERVER_ERROR");

  const { id, revocationToken } = result.getResult()!;
  return res.json({
    id,
    revocationToken,
  });
};
