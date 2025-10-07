import cron from "node-cron";
import { logJobExecution } from "../src/utils/job/logJobExecution";
import getLogger from "../src/utils/logger";
import { batchTransactions } from "./batchTransactions/batchTransactions";
import { getRecommendedFeeRatesCronjob } from "./getRecommendedFeeRates";

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

  serverLogger.info("Jobs initialised!");
};
