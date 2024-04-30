import { Psbt } from "bitcoinjs-lib";
import { sha256 } from "../crypto";
import { KEYS } from "../db/keys";
import { SubClient } from "../db/SubClient";

export const addPSBTToBatchWithClient = (
  client: SubClient,
  txId: string,
  psbt: Psbt
) => {
  const base64 = psbt.toBase64();
  const id = sha256(base64);
  return Promise.all([
    client.sadd(KEYS.BATCH + txId, base64),
    client.hset(KEYS.PSBT.PREFIX + id, { txId }),
  ]);
};
