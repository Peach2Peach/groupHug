import { Express } from "express";
import { addResponseHeaders } from "../../middleware/addResponseHeaders";
import { cache } from "../../middleware/cache";
import getLogger from "../../src/utils/logger";
import { getBatchStatusController } from "./getBatchStatusController";
import { getBatchStatusOverviewController } from "./getBatchStatusOverviewController";
import { getFeeRateInfo } from "./getFeeRateInfo";
import { validateGetBatchStatus } from "./validation/validateGetBatchStatus";

const serverLogger = getLogger("server", "log");

export const Batch = (app: Express): void => {
  app.get(
    "/v1/batch",
    addResponseHeaders({
      "Cache-control": "public, max-age=60",
    }),
    validateGetBatchStatus,
    getBatchStatusController,
  );
  app.get(
    "/v1/batch/overview",
    addResponseHeaders({
      "Cache-control": "public, max-age=60",
    }),
    getBatchStatusOverviewController,
  );
  app.get(
    "/v1/queue/feeRateInfo",
    addResponseHeaders({
      "Cache-control": "public, max-age=60",
    }),
    cache,
    getFeeRateInfo,
  );

  serverLogger.info("Installed batch endpoints");
};
