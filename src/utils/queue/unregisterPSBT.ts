import { Psbt } from "bitcoinjs-lib";
import { sha256 } from "../crypto";
import { db } from "../db";
import { SubClient } from "../db/SubClient";
import { unregisterPSBTWithIdWithClient } from "./unregisterPSBTWithId";

export const unregisterPSBTWithClient = async (
  client: SubClient,
  psbt: Psbt,
) => {
  const base64 = psbt.toBase64();
  const id = sha256(base64);

  await unregisterPSBTWithIdWithClient(client, id);
};

export const unregisterPSBT = (psbt: Psbt) =>
  db.transaction((client) => unregisterPSBTWithClient(client, psbt));
