import { Psbt } from "bitcoinjs-lib";
import { NETWORK } from "../../constants";
import { db } from "../../src/utils/db";
import { KEYS } from "../../src/utils/db/keys";
import { getTx } from "../../src/utils/electrs/getTx";
import { getTxIdOfInput } from "../../src/utils/psbt";
import { addPSBTToQueue } from "../../src/utils/queue/addPSBTToQueue";
import { respondWithError } from "../../src/utils/response";
import { AddPSBTRequest, AddPSBTResponse } from "./types";

export const addPSBTController = async (
  req: AddPSBTRequest,
  res: AddPSBTResponse,
) => {
  const { psbt: base64, index } = req.body;

  const psbt = Psbt.fromBase64(base64, { network: NETWORK });
  const transaction = (await getTx(getTxIdOfInput(psbt.txInputs[0]))).result;
  const queuedTransactions = await db.client.sMembers(KEYS.PSBT.QUEUE);
  const isPartOfQueue = queuedTransactions.includes(base64);
  if (!transaction || !transaction.status.confirmed || isPartOfQueue) {
    return respondWithError(res, "BAD_REQUEST");
  }
  const queuedPSBTs = await Promise.all(
    queuedTransactions.map((queuedTx) =>
      Psbt.fromBase64(queuedTx, { network: NETWORK }),
    ),
  );
  const queuedTxInputs = queuedPSBTs.map((e) => e.txInputs[0]);
  const [txInput] = psbt.txInputs;
  if (
    queuedTxInputs.some(
      (e) => e.hash.equals(txInput.hash) && e.index === txInput.index,
    )
  ) {
    return respondWithError(res, "BAD_REQUEST");
  }

  const { ok, result } = await addPSBTToQueue(psbt, index);

  if (!ok) return respondWithError(res, "INTERNAL_SERVER_ERROR");

  const { id, revocationToken } = result;
  return res.json({
    id,
    revocationToken,
  });
};
