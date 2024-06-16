import { randomUUID } from "crypto";
import { sha256 } from "../crypto/sha256";
import { KEYS } from "../db/keys";
import { SubClient } from "../db/SubClient";

export const registerPSBTWithClient = async (
  client: SubClient,
  base64: string,
  index?: number,
) => {
  const id = sha256(base64);
  const revocationToken = randomUUID().replace(/-/gu, "");

  await client.hset(KEYS.PSBT.PREFIX + id, {
    psbt: base64,
    revocationToken,
    index,
  });

  return { id, revocationToken };
};
