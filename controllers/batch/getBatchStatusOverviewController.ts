import { Request, Response } from "express";
import { db } from "../../src/utils/db";
import { KEYS } from "../../src/utils/db/keys";

type Res = Response<
  | {
      /** @deprecated Will be removed in the next release */
      participants: number;
      /** @deprecated Will be removed in the next release */
      maxParticipants: number;
      /** @deprecated Will be removed in the next release */
      timeRemaining: number;
      minimumWaitTime: number;
      maximumWaitTime: number;
      transactionsInQueue: number;
      completed: false;
    }
  | APIError<null>
>;

export const getBatchStatusOverviewController = async (
  _req: Request,
  res: Res,
) => {
  const minimumWaitTime = await db.client.ttl(KEYS.BUCKET.TIME_THRESHOLD);
  const maximumWaitTime = await db.client.ttl(KEYS.BUCKET.EXPIRATION);
  const transactionsInQueue = await db.client.sCard(KEYS.PSBT.QUEUE);

  return res.json({
    participants: transactionsInQueue,
    maxParticipants: transactionsInQueue,
    timeRemaining: minimumWaitTime,
    minimumWaitTime,
    maximumWaitTime,
    transactionsInQueue,
    completed: false,
  });
};
