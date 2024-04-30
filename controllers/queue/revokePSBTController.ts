import { db } from "../../src/utils/db";
import { KEYS } from "../../src/utils/db/keys";
import { respondWithError } from "../../src/utils/response";
import { RevokePSBTRequest, RevokePSBTResponse } from "./types";

export const revokePSBTController = async (
  req: RevokePSBTRequest,
  res: RevokePSBTResponse
) => {
  const { id } = req.body;

  const result = await db.transaction(async (client) => {
    const psbt = await client.client.hGet(KEYS.PSBT.PREFIX + id, "psbt");
    if (!psbt) return respondWithError(res, "NOT_FOUND");
    await client.srem(KEYS.PSBT.QUEUE, psbt);
    await client.del(KEYS.PSBT.PREFIX + id);
  });

  return res.json({ success: result.isOk() });
};
