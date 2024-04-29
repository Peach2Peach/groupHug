import { db } from "../../src/utils/db";
import { KEYS } from "../../src/utils/db/keys";
import {
  GetBatchStatusOverviewRequest,
  GetBatchStatusOverviewResponse,
} from "./types";

export const getBatchStatusOverviewController = async (
  _req: GetBatchStatusOverviewRequest,
  res: GetBatchStatusOverviewResponse
) => {
  const [rawParticipants, rawMaxParticipants] = await db.hmget(
    KEYS.BUCKET.STATUS,
    ["participants", "maxParticipants"]
  );

  const ttl = await db.client.ttl(KEYS.BUCKET.EXPIRATION);

  return res.json({
    participants: Number(rawParticipants),
    maxParticipants: Number(rawMaxParticipants),
    timeRemaining: ttl,
    completed: false,
  });
};
