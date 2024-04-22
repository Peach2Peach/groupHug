import { getDefaultLevel } from "./getDefaultLevel";
import { LogLevel, getLogLevels } from "./logLevels";

/**
 * @description Method to get default log level
 * Log levels are defined via environment variables.
 * If given category (and name) are not specified, we fall back to
 * either provided default level or default level of environment
 */
export const getLogLevel = (
  category?: string,
  name?: string,
  fallback?: LogLevel,
): LogLevel => {
  const logLevels = getLogLevels();
  return (
    logLevels[`${category}-${name}`] ||
    logLevels[category] ||
    fallback ||
    getDefaultLevel()
  );
};
