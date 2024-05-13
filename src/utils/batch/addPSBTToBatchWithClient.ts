import { sha256 } from "../crypto/sha256";
import { KEYS } from "../db/keys";
import { SubClient } from "../db/SubClient";

export const addPSBTToBatchWithClient = (
  client: SubClient,
  txId: string,
  base64: string,
) => {
  const id = sha256(base64);
  return Promise.all([
    client.sadd(KEYS.BATCH + txId, base64),
    client.hset(KEYS.PSBT.PREFIX + id, { txId }),
  ]);
};
