import { Psbt } from "bitcoinjs-lib";
import { sha256 } from "../crypto";
import { randomUUID } from "crypto";
import { db } from "../db";
import { KEYS } from "../db/keys";
import { SubClient } from "../db/SubClient";

export const registerPSBTWithClient = async (
  client: SubClient,
  psbt: Psbt,
  index?: number,
) => {
  const base64 = psbt.toBase64();
  const id = sha256(base64);
  const revocationToken = randomUUID().replace(/-/gu, "");

  await client.hset(KEYS.PSBT.PREFIX + id, {
    psbt: base64,
    revocationToken,
    index,
  });

  return { id, revocationToken };
};

export const registerPSBT = (psbt: Psbt, index?: number) =>
  db.transaction((client) => registerPSBTWithClient(client, psbt, index));
