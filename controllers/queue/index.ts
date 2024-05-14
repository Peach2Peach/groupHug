import { Express } from "express";
import getLogger from "../../src/utils/logger";
import { addPSBTController } from "./addPSBTController";
import { revokePSBTController } from "./revokePSBTController";
import { validatePSBT } from "./validation/validatePSBT";
import { validateRevokePSBT } from "./validation/validateRevokePSBT";

const serverLogger = getLogger("server", "log");

export const Queue = (app: Express): void => {
  app.post("/v1/addPSBT", validatePSBT, addPSBTController);
  app.post("/v1/revokePSBT", validateRevokePSBT, revokePSBTController);

  serverLogger.info("Installed queue endpoints");
};
