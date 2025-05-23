import { Psbt } from "bitcoinjs-lib";
import { Request, Response } from "express";
import { NETWORK, SECONDS_IN_MINUTE } from "../../constants";
import { finalizeBatch } from "../../cronjobs/batchTransactions/finalizeBatch";
import { getServiceFees } from "../../cronjobs/batchTransactions/getServiceFees";
import { getUTXOForInput } from "../../cronjobs/batchTransactions/getUTXOForInput";
import { inputIsUnspent } from "../../cronjobs/batchTransactions/helpers/inputIsUnspent";
import { getExcessMiningFees } from "../../src/utils/batch/getExcessMiningFees";
import { cacheDB, db } from "../../src/utils/db";
import { KEYS } from "../../src/utils/db/keys";
import { getPreferredFeeRate } from "../../src/utils/electrs/getPreferredFeeRate";
import { respondWithError } from "../../src/utils/response/respondWithError";

type Res = Response<
  | {
      queueFeeRate: number;
      preferredFeeRate: number;
      serviceFees: number;
      excessMiningFees: number;
      transactionsInFullBucket: number;
    }
  | APIError<null>
>;

export const getFeeRateInfo = async (req: Request, res: Res) => {
  const preferredFeeRate = await getPreferredFeeRate();
  if (!preferredFeeRate) return respondWithError(res, "INTERNAL_SERVER_ERROR");

  const queuedBase64PSBTs = await db.client.sMembers(KEYS.PSBT.QUEUE);
  if (!queuedBase64PSBTs.length) {
    return res.json({
      queueFeeRate: 0,
      preferredFeeRate,
      serviceFees: 0,
      excessMiningFees: 0,
      transactionsInFullBucket: 0,
    });
  }
  const allPSBTs = await Promise.all(
    queuedBase64PSBTs.map((base64) =>
      Psbt.fromBase64(base64, { network: NETWORK }),
    ),
  );
  const allTxInputs = allPSBTs.map((psbt) => psbt.txInputs[0]);
  const utxos = await Promise.all(allTxInputs.map(getUTXOForInput));
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
    finalTransaction.virtualSize(),
    stagedTx.getFee(),
  );

  const response = {
    queueFeeRate,
    preferredFeeRate,
    serviceFees,
    excessMiningFees,
    transactionsInFullBucket: unspentPSBTs.length,
  };
  await cacheDB.client.setEx(
    KEYS.CACHE.PREFIX + req.originalUrl,
    SECONDS_IN_MINUTE,
    JSON.stringify(response),
  );

  return res.json(response);
};
