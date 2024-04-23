import { NETWORK } from "../../constants";
import { getPSBTsFromBatch } from "../../src/utils/batch";
import { getBucketStatus, getExtraPSBTDataById } from "../../src/utils/queue";
import { respondWithError } from "../../src/utils/response";
import { GetBatchStatusRequest, GetBatchStatusResponse } from "./types";

export const getBatchStatusController = async (
  req: GetBatchStatusRequest,
  res: GetBatchStatusResponse,
) => {
  const { id } = req.query;

  if (id) {
    const psbtInfo = await getExtraPSBTDataById(id);
    if (!psbtInfo) return respondWithError(res, "NOT_FOUND");
    if (psbtInfo.txId) {
      const participants = await getPSBTsFromBatch(psbtInfo.txId, NETWORK);
      return res.json({
        participants: participants.length,
        maxParticipants: participants.length,
        timeRemaining: 0,
        completed: true,
        txId: psbtInfo.txId,
      });
    }
  }

  const bucketStatus = await getBucketStatus();

  return res.json(bucketStatus);
};
