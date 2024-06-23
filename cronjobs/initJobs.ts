import cron from "node-cron";
import { logJobExecution } from "../src/utils/job/logJobExecution";
import getLogger from "../src/utils/logger";
import { batchTransactions } from "./batchTransactions/batchTransactions";

const serverLogger = getLogger("server", "log");

export const initJobs = () => {
  cron.schedule("*/10 * * * *", () =>
    logJobExecution("batchTransactions", batchTransactions),
  );

  serverLogger.info("Jobs initialised!");
};
