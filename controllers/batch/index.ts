import { Express } from "express";
import { addResponseHeaders } from "../../middleware/addResponseHeaders";
import getLogger from "../../src/utils/logger";
import { getBatchStatusController } from "./getBatchStatusController";
import { getBatchStatusOverviewController } from "./getBatchStatusOverviewController";
import { validateGetBatchStatus } from "./validation/validateGetBatchStatus";

const serverLogger = getLogger("server", "log");

export const Batch = (app: Express): void => {
  app.get(
    "/v1/batch",
    addResponseHeaders({
      "Cache-control": "public, max-age=60",
    }),
    validateGetBatchStatus,
    getBatchStatusController
  );
  app.get(
    "/v1/batch/overview",
    addResponseHeaders({
      "Cache-control": "public, max-age=60",
    }),
    getBatchStatusOverviewController
  );

  serverLogger.info("Installed batch endpoints");
};
