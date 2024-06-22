import { Request, Response } from "express";
import { db } from "../../src/utils/db";
import { KEYS } from "../../src/utils/db/keys";
import { getBatchStatusOverviewController } from "./getBatchStatusOverviewController";

type Req = Request<Record<string, never>, unknown, unknown, { id: string }>;
type Res = Response<
  | {
      participants: number;
      /** @deprecated Will be removed in the next release */
      maxParticipants: number;
      timeRemaining: number;
      completed: boolean;
      txId?: string;
    }
  | APIError<null>
>;

export const getBatchStatusController = async (req: Req, res: Res) => {
  const { id } = req.query;

  const txId = await db.client.hGet(KEYS.PSBT.PREFIX + id, "txId");
  if (!txId) return getBatchStatusOverviewController(req, res);

  const participants = await db.client.sCard(KEYS.BATCH + txId);
  return res.json({
    maxParticipants: participants,
    participants,
    timeRemaining: 0,
    completed: true,
    txId,
  });
};
