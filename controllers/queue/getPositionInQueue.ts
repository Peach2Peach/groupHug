import { Psbt } from "bitcoinjs-lib";
import { Request, Response } from "express";
import { NETWORK, SECONDS_IN_MINUTE } from "../../constants";
import { getUTXOForInput } from "../../cronjobs/batchTransactions/getUTXOForInput";
import { inputIsUnspent } from "../../cronjobs/batchTransactions/helpers/inputIsUnspent";
import { attemptPushToBucket } from "../../src/utils/batch/attemptPushToBucket";
import { sha256 } from "../../src/utils/crypto/sha256";
import { cacheDB, db } from "../../src/utils/db";
import { KEYS } from "../../src/utils/db/keys";
import { getPreferredFeeRate } from "../../src/utils/electrs/getPreferredFeeRate";
import { mapPSBTToDensity } from "../../src/utils/psbt/mapPSBTToDensity";
import { respondWithError } from "../../src/utils/response/respondWithError";
import { isDefined } from "../../src/utils/validation/isDefined";

type Req = Request<unknown, unknown, unknown, { id: string }>;

type Res = Response<
  | {
      positionInQueue: number;
      transactionsInNextBucket: number;
      transactionsInQueue: number;
    }
  | APIError<null>
>;

const NUMBER_OF_MINUTES = 10;

export const getPositionInQueue = async (req: Req, res: Res) => {
  const preferredFeeRate = await getPreferredFeeRate();
  if (!preferredFeeRate) return respondWithError(res, "INTERNAL_SERVER_ERROR");

  const { id } = req.query;

  const queuedBase64PSBTs = await db.client.sMembers(KEYS.PSBT.QUEUE);
  const psbtExists = (await db.client.exists(KEYS.PSBT.PREFIX + id)) === 0;
  const psbtWasBatched =
    (await db.client.hGet(KEYS.PSBT.PREFIX + id, "txId")) !== null;
  if (!queuedBase64PSBTs.length || !psbtExists || psbtWasBatched)
    return respondWithError(res, "NOT_FOUND");

  const allPSBTs = queuedBase64PSBTs.map((base64) =>
    Psbt.fromBase64(base64, { network: NETWORK }),
  );
  const allTxInputs = allPSBTs.map((psbt) => psbt.txInputs[0]);
  const utxos = (await Promise.all(allTxInputs.map(getUTXOForInput))).filter(
    isDefined,
  );
  const unspentPSBTs = allPSBTs.filter((psbt, i) =>
    inputIsUnspent(psbt.txInputs[0], utxos[i]),
  );

  const psbtsMappedToDensity = await Promise.all(
    unspentPSBTs.map(mapPSBTToDensity),
  );
  const sortedPsbts = psbtsMappedToDensity.sort(
    (a, b) => b.density - a.density,
  );
  const positionInQueue =
    sortedPsbts.findIndex(({ psbt }) => sha256(psbt.toBase64()) === id) + 1;
  const bucket: Psbt[] = [];
  for (const { psbt } of sortedPsbts) {
    // eslint-disable-next-line no-await-in-loop -- we need to wait for the result of the function
    await attemptPushToBucket(psbt, bucket, preferredFeeRate);
  }

  const response = {
    transactionsInQueue: queuedBase64PSBTs.length,
    transactionsInNextBucket: bucket.length,
    positionInQueue,
  };
  await cacheDB.client.setEx(
    KEYS.CACHE.PREFIX + req.originalUrl,
    NUMBER_OF_MINUTES * SECONDS_IN_MINUTE,
    JSON.stringify(response),
  );

  return res.json(response);
};
