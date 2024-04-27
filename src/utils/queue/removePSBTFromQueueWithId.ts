import { db } from "../db";
import { KEYS } from "../db/keys";
import { getExtraPSBTDataById } from "./getExtraPSBTDataById";

export const removePSBTFromQueueWithId = (id: string) =>
  db.transaction(async (client) => {
    const extraData = (await getExtraPSBTDataById(id))!;
    await client.zrem(KEYS.PSBT.QUEUE, extraData.psbt);
    await client.del(KEYS.PSBT.PREFIX + id);
  });
