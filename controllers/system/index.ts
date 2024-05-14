import { Express } from "express";
import { addResponseHeaders } from "../../middleware/addResponseHeaders";
import getLogger from "../../src/utils/logger";
import { getStatusController } from "./getStatusController";
import { startController } from "./startController";

const serverLogger = getLogger("server", "log");

export const System = (app: Express): void => {
  app.post("/v1/start", startController);
  app.get(
    "/v1/system/status",

    addResponseHeaders({
      "Cache-control": "public, max-age=0",
    }),
    getStatusController,
  );

  serverLogger.info("Installed system endpoints");
};
