import {
  LOGLEVEL_DEBUG,
  LOGLEVEL_ERROR,
  LOGLEVEL_HTTP,
  LOGLEVEL_INFO,
  LOGLEVEL_WARN,
} from "../../../constants";

export type LogLevel = "error" | "warn" | "http" | "info" | "debug";
type Loglevels = {
  [key: string]: LogLevel;
};
export const getLogLevels = (): Loglevels => ({
  ...LOGLEVEL_ERROR.split(",").reduce(
    (obj, cat) => ({ ...obj, [cat]: "error" }),
    {},
  ),
  ...LOGLEVEL_WARN.split(",").reduce(
    (obj, cat) => ({ ...obj, [cat]: "warn" }),
    {},
  ),
  ...LOGLEVEL_HTTP.split(",").reduce(
    (obj, cat) => ({ ...obj, [cat]: "http" }),
    {},
  ),
  ...LOGLEVEL_INFO.split(",").reduce(
    (obj, cat) => ({ ...obj, [cat]: "info" }),
    {},
  ),
  ...LOGLEVEL_DEBUG.split(",").reduce(
    (obj, cat) => ({ ...obj, [cat]: "debug" }),
    {},
  ),
});
