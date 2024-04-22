import { db } from "../db";
import { KEYS } from "../db/keys";

export type PSBTInfo = {
  psbt: string;
  index?: number;
  txId?: string;
  revocationToken: string;
};
export const getExtraPSBTDataById = async (id: string): Promise<PSBTInfo> => {
  const rawInfo = await db.hgetall(KEYS.PSBT.PREFIX + id);
  if (!rawInfo) return null;

  return {
    psbt: rawInfo.psbt,
    revocationToken: rawInfo.revocationToken,
    txId: rawInfo.txId,
    index: rawInfo.index ? Number(rawInfo.index) : undefined,
  };
};
