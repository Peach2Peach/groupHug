import { Psbt } from "bitcoinjs-lib";
import { Request, Response } from "express";
import { MS_IN_MINUTE, NETWORK } from "../../constants";
import { finalizeBatch } from "../../cronjobs/batchTransactions/finalizeBatch";
import { getServiceFees } from "../../cronjobs/batchTransactions/getServiceFees";
import { getUTXOForInput } from "../../cronjobs/batchTransactions/getUTXOForInput";
import { inputIsUnspent } from "../../cronjobs/batchTransactions/helpers/inputIsUnspent";
import { getExcessMiningFees } from "../../src/utils/batch/getExcessMiningFees";
import { cacheDB, db } from "../../src/utils/db";
import { KEYS } from "../../src/utils/db/keys";
import { getPreferredFeeRate } from "../../src/utils/electrs/getPreferredFeeRate";
import { respondWithError } from "../../src/utils/response/respondWithError";
import { isDefined } from "../../src/utils/validation/isDefined";

type Req = Request<Record<string, never>, unknown, unknown, { id: string }>;
type Res = Response<
  | {
      queueFeeRate: number;
      preferredFeeRate: number;
      serviceFees: number;
      excessMiningFees: number;
    }
  | APIError<null>
>;

export const getFeeRateInfo = async (req: Req, res: Res) => {
  const preferredFeeRate = await getPreferredFeeRate();
  if (!preferredFeeRate) return respondWithError(res, "INTERNAL_SERVER_ERROR");

  const queuedBase64PSBTs = await db.client.sMembers(KEYS.PSBT.QUEUE);
  const allPSBTs = await Promise.all(
    queuedBase64PSBTs.map((base64) =>
      Psbt.fromBase64(base64, { network: NETWORK }),
    ),
  );
  const allTxInputs = allPSBTs.map((psbt) => psbt.txInputs[0]);
  const utxos = (await Promise.all(allTxInputs.map(getUTXOForInput))).filter(
    isDefined,
  );
  const unspentPSBTs = allPSBTs.filter((_psbt, i) =>
    inputIsUnspent(allTxInputs[i], utxos[i]),
  );
  const serviceFees = getServiceFees(unspentPSBTs);

  const { stagedTx, finalTransaction } = await finalizeBatch(
    unspentPSBTs,
    serviceFees,
  );
  const queueFeeRate = stagedTx.getFeeRate();
  const excessMiningFees = getExcessMiningFees(
    preferredFeeRate,
    queueFeeRate,
    finalTransaction.virtualSize(),
  );
  await cacheDB.client.setEx(
    KEYS.CACHE.PREFIX + req.originalUrl,
    MS_IN_MINUTE,
    JSON.stringify({
      queueFeeRate,
      preferredFeeRate,
      serviceFees,
      excessMiningFees,
    }),
  );

  return res.json({
    queueFeeRate,
    preferredFeeRate,
    serviceFees,
    excessMiningFees,
  });
};
