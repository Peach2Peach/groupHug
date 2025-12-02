import { db } from "../src/utils/db";
import { KEYS } from "../src/utils/db/keys";

import getLogger from "../src/utils/logger";

const logger = getLogger("job", "updateFeeCollectorDerivationPath");

export const updateFeeCollectorDerivationPath = async () => {
  const currentIndex = Number((await db.client.get(KEYS.FEE.INDEX)) || 0);
  const currentMonthlyIndex = Number(
    (await db.client.get(KEYS.FEE.MONTH_INDEX)) || 0,
  );

  await db.transaction(async (client) => {
    //increment
    await client.incr(KEYS.FEE.MONTH_INDEX);
    //back to zero
    await client.set(KEYS.FEE.INDEX, 0);
  });

  logger.info(
    `Reset Fee Collector derivation path (moved from ${currentMonthlyIndex} / ${currentIndex})`,
  );
  return true;
};
