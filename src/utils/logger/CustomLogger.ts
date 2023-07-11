import winston, { Logger } from 'winston'
import { LogLevel } from './logLevels'
import { getLogLevel } from './getLogLevel'
import { templateFunction } from './templateFunction'

const { combine, label, timestamp, printf, errors } = winston.format

const MAXSIZE = 5242880 // 5MB

/**
 * @description Method to create logger
 * @example const logger = getLogger('controller', 'System')
 */
export const CustomLogger = (category: string, name: string, defaultLevel?: LogLevel): Logger => {
  if (winston.loggers.has(`${category}-${name}`)) return winston.loggers.get(`${category}-${name}`)
  const level = getLogLevel(category, name, defaultLevel)

  return winston.loggers.add(`${category}-${name}`, {
    level,
    format: combine(
      errors({ stack: true }),
      label({
        label: `${category}-${name}`,
      }),
      timestamp({
        format: 'MMM-DD-YYYY HH:mm:ss',
      }),
      printf(templateFunction),
    ),
    transports: [
      new winston.transports.Console({ level }),
      new winston.transports.File({
        level,
        filename: `logs/${category}-${name}.log`,
        maxsize: MAXSIZE,
      }),
    ],
  })
}
