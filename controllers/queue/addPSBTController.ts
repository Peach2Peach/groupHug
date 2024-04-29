import { Psbt } from "bitcoinjs-lib";
import { NETWORK } from "../../constants";
import { getTx } from "../../src/utils/electrs/getTx";
import { getTxIdOfInput } from "../../src/utils/psbt";
import { addPSBTToQueue } from "../../src/utils/queue/addPSBTToQueue";
import { respondWithError } from "../../src/utils/response";
import { AddPSBTRequest, AddPSBTResponse } from "./types";

export const addPSBTController = async (
  req: AddPSBTRequest,
  res: AddPSBTResponse
) => {
  const { psbt: base64, feeRate, index } = req.body;

  const psbt = Psbt.fromBase64(base64, { network: NETWORK });

  const transactions = await Promise.all(
    psbt.txInputs.map(
      async (input) => (await getTx(getTxIdOfInput(input))).result
    )
  );
  if (transactions.some((tx) => !tx || !tx.status.confirmed)) {
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
