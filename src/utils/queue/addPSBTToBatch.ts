import { Psbt } from "bitcoinjs-lib";
import { db } from "../db";
import { SubClient } from "../db/SubClient";
import { KEYS } from "../db/keys";

export const addPSBTToBatchWithClient = (
  client: SubClient,
  txId: string,
  psbt: Psbt,
  feeRate: number,
) => client.zadd(KEYS.BATCH + txId, feeRate, psbt.toBase64());

export const addPSBTToBatch = (txId: string, psbt: Psbt, feeRate: number) =>
  db.transaction((client) =>
    addPSBTToBatchWithClient(client, txId, psbt, feeRate),
  );
