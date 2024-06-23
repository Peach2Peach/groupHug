import { Psbt } from "bitcoinjs-lib";
import { Request, Response } from "express";
import { NETWORK, SECONDS_IN_MINUTE } from "../../constants";
import { fillUpBucket } from "../../cronjobs/batchTransactions/fillUpBucket";
import { getUTXOForInput } from "../../cronjobs/batchTransactions/getUTXOForInput";
import { inputIsUnspent } from "../../cronjobs/batchTransactions/helpers/inputIsUnspent";
import { cacheDB, db } from "../../src/utils/db";
import { KEYS } from "../../src/utils/db/keys";
import { getPreferredFeeRate } from "../../src/utils/electrs/getPreferredFeeRate";
import { mapPSBTToDensity } from "../../src/utils/psbt/mapPSBTToDensity";
import { respondWithError } from "../../src/utils/response/respondWithError";
import { isDefined } from "../../src/utils/validation/isDefined";

type Res = Response<
  | {
      transactionsInQueue: number;
      transactionsInNextBucket: number;
    }
  | APIError<null>
>;

const NUMBER_OF_MINUTES = 5;

export const getParticipationRate = async (req: Request, res: Res) => {
  const preferredFeeRate = await getPreferredFeeRate();
  if (!preferredFeeRate) return respondWithError(res, "INTERNAL_SERVER_ERROR");

  const queuedBase64PSBTs = await db.client.sMembers(KEYS.PSBT.QUEUE);
  if (!queuedBase64PSBTs.length) {
    return res.json({
      transactionsInQueue: 0,
      transactionsInNextBucket: 0,
    });
  }
  const allPSBTs = queuedBase64PSBTs.map((base64) =>
    Psbt.fromBase64(base64, { network: NETWORK }),
  );
  const allTxInputs = allPSBTs.map((psbt) => psbt.txInputs[0]);
  const utxos = (await Promise.all(allTxInputs.map(getUTXOForInput))).filter(
    isDefined,
  );
  const unspentPSBTs = allPSBTs.filter((_psbt, i) =>
    inputIsUnspent(allTxInputs[i], utxos[i]),
  );
  const psbtsMappedToDensity = await Promise.all(
    unspentPSBTs.map(mapPSBTToDensity),
  );
  const sortedPsbts = psbtsMappedToDensity.sort(
    (a, b) => b.density - a.density,
  );
  const bucket = await fillUpBucket(sortedPsbts, preferredFeeRate);

  const response = {
    transactionsInQueue: queuedBase64PSBTs.length,
    transactionsInNextBucket: bucket.length,
  };
  await cacheDB.client.setEx(
    KEYS.CACHE.PREFIX + req.originalUrl,
    NUMBER_OF_MINUTES * SECONDS_IN_MINUTE,
    JSON.stringify(response),
  );

  return res.json(response);
};
