import { NODE_ENV } from "../../../constants";
import { LogLevel } from "./logLevels";

export const getDefaultLevel = (): LogLevel =>
  NODE_ENV === "production" ? "warn" : "info";
