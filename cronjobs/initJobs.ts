import cron from "node-cron";
import { logJobExecution } from "../src/utils/job/logJobExecution";
import getLogger from "../src/utils/logger";
import { batchTransactions } from "./batchTransactions/batchTransactions";
import { getRecommendedFeeRatesCronjob } from "./getRecommendedFeeRates";
import { updateFeeCollectorDerivationPath } from "./updateFeeCollectorDerivationPath";

const serverLogger = getLogger("server", "log");

export const initJobs = () => {
  cron.schedule("*/10 * * * *", () =>
    logJobExecution("batchTransactions", batchTransactions),
  );

  // get recommended fee estimates every 15 seconds
  cron.schedule("*/15 * * * * *", () =>
    logJobExecution(
      "getRecommendedFeeRatesCronjob",
      getRecommendedFeeRatesCronjob,
    ),
  );

  /**
   * set the Fee collector derivation path.
   * Run at midnight on the 1st of every month
   *
   * INCREASING_INDEX is set to zero
   * MONTH_INDEX increments by 1
   */
  cron.schedule(
    "0 0 1 * *",
    () =>
      logJobExecution(
        "updateFeeCollectorDerivationPath",
        updateFeeCollectorDerivationPath,
      ),
    { timezone: "Etc/UTC" },
  );

  serverLogger.info("Jobs initialised!");
};
