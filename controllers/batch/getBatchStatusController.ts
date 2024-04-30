import { NETWORK } from "../../constants";
import { getPSBTsFromBatch } from "../../src/utils/batch/getPSBTsFromBatch";
import { db } from "../../src/utils/db";
import { KEYS } from "../../src/utils/db/keys";
import { getBatchStatusOverviewController } from "./getBatchStatusOverviewController";
import { GetBatchStatusRequest, GetBatchStatusResponse } from "./types";

export const getBatchStatusController = async (
  req: GetBatchStatusRequest,
  res: GetBatchStatusResponse
) => {
  const { id } = req.query;

  if (id) {
    const txId = await db.client.hGet(KEYS.PSBT.PREFIX + id, "txId");
    if (txId) {
      const participants = await getPSBTsFromBatch(txId, NETWORK);
      return res.json({
        participants: participants.length,
        maxParticipants: participants.length,
        timeRemaining: 0,
        completed: true,
        txId,
      });
    }
  }

  return getBatchStatusOverviewController(req, res);
};
