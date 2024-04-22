import { db } from "../db";
import { SubClient } from "../db/SubClient";
import { KEYS } from "../db/keys";
import { getExtraPSBTDataById } from "./getExtraPSBTDataById";
import { unregisterPSBTWithIdWithClient } from "./unregisterPSBTWithId";

export const removePSBTFromQueueWithIdWithClient = async (
  client: SubClient,
  id: string,
) => {
  const extraData = (await getExtraPSBTDataById(id))!;
  await client.zrem(KEYS.PSBT.QUEUE, extraData.psbt);
  return unregisterPSBTWithIdWithClient(client, id);
};

export const removePSBTFromQueueWithId = (id: string) =>
  db.transaction(async (client) => {
    await removePSBTFromQueueWithIdWithClient(client, id);
  });
