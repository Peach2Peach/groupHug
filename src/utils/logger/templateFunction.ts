import { TransformableInfo } from "logform";

export const templateFunction = (log: TransformableInfo): string =>
  `${log.level}: ${log.label}: ${log.timestamp}: ${log.message}` +
  (log.stack ? `\n${log.stack}` : "");
