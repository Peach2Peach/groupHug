import { BATCH_TIME_THRESHOLD, MSINS } from "../../../constants";
import { db } from "../db";
import { KEYS } from "../db/keys";

export const resetBucketExpiration = () =>
  db.transaction(async (client) => {
    await client.set(
      KEYS.BUCKET.EXPIRATION,
      "true",
      BATCH_TIME_THRESHOLD * MSINS
    );
  });
