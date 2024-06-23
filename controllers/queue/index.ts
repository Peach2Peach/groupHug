import { Express } from "express";
import { addResponseHeaders } from "../../middleware/addResponseHeaders";
import { cache } from "../../middleware/cache";
import getLogger from "../../src/utils/logger";
import { addPSBTController } from "./addPSBTController";
import { getFeeRateInfo } from "./getFeeRateInfo";
import { getParticipationRate } from "./getParticipationRate";
import { getPositionInQueue } from "./getPositionInQueue";
import { revokePSBTController } from "./revokePSBTController";
import { validatePSBT } from "./validation/validatePSBT";
import { validateRevokePSBT } from "./validation/validateRevokePSBT";

const serverLogger = getLogger("server", "log");

export const Queue = (app: Express): void => {
  app.post("/v1/addPSBT", validatePSBT, addPSBTController);
  app.post("/v1/revokePSBT", validateRevokePSBT, revokePSBTController);
  app.get(
    "/v1/queue/feeRateInfo",
    addResponseHeaders({
      "Cache-control": "public, max-age=60",
    }),
    cache,
    getFeeRateInfo,
  );
  app.get(
    "/v1/queue/participationRate",
    addResponseHeaders({
      "Cache-control": "public, max-age=60",
    }),
    cache,
    getParticipationRate,
  );
  app.get(
    "/v1/queue/positionInQueue",
    addResponseHeaders({
      "Cache-control": "public, max-age=60",
    }),
    cache,
    getPositionInQueue,
  );

  serverLogger.info("Installed queue endpoints");
};
