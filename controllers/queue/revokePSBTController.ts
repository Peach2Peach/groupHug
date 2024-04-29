import { db } from "../../src/utils/db";
import { KEYS } from "../../src/utils/db/keys";
import { getExtraPSBTDataById } from "../../src/utils/queue/getExtraPSBTDataById";
import { RevokePSBTRequest, RevokePSBTResponse } from "./types";

export const revokePSBTController = async (
  req: RevokePSBTRequest,
  res: RevokePSBTResponse
) => {
  const { id } = req.body;

  const result = await db.transaction(async (client) => {
    const extraData = await getExtraPSBTDataById(id);
    if (!extraData) throw new Error("PSBT not found");
    await client.zrem(KEYS.PSBT.QUEUE, extraData.psbt);
    await client.del(KEYS.PSBT.PREFIX + id);
  });

  return res.json({ success: result.isOk() });
};
