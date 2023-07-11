import winston, { Logger } from 'winston'
import { loadDotenv } from '../dotenv'
const { combine, label, timestamp, printf } = winston.format
loadDotenv()

type LogLevel = 'error' | 'warn' | 'http' | 'info' | 'debug'
type Loglevels = {
  [key: string]: LogLevel
}

const logLevels: Loglevels = {
  ...process.env.LOGLEVEL_ERROR.split(',').reduce((obj, cat) => ({ ...obj, [cat]: 'error' }), {}),
  ...process.env.LOGLEVEL_WARN.split(',').reduce((obj, cat) => ({ ...obj, [cat]: 'warn' }), {}),
  ...process.env.LOGLEVEL_HTTP.split(',').reduce((obj, cat) => ({ ...obj, [cat]: 'http' }), {}),
  ...process.env.LOGLEVEL_INFO.split(',').reduce((obj, cat) => ({ ...obj, [cat]: 'info' }), {}),
  ...process.env.LOGLEVEL_DEBUG.split(',').reduce((obj, cat) => ({ ...obj, [cat]: 'debug' }), {}),
}

const getDefaultLevel = (): LogLevel => {
  const env = process.env.NODE_ENV || 'development'
  return env === 'development' ? 'info' : 'warn'
}

/**
 * @description Method to get default log level
 * Log levels are defined via environment variables.
 * If given category (and name) are not specified, we fall back to
 * either provided default level or default level of environment
 * @param category log category
 * @param name logger name
 * @param [defaultLevel] level to fall back to if no level has been specified otherwise
 * @returns log level
 */
const getLogLevel = (category: string, name: string, defaultLevel?: LogLevel): LogLevel =>
  logLevels[`${category}-${name}`] || logLevels[category] || defaultLevel || getDefaultLevel()

const errorStackFormat = winston.format((info) => {
  if (info instanceof Error) {
    return {
      ...info,
      stack: info.stack,
      message: info.mesage,
    }
  }
  return info
})

/**
 * @description Method to create logger
 * @param {string} category the log category
 * @param {string} name the name of the log
 * @returns {Logger} logger instance
 * @example const logger = getLogger('controller', 'System')
 */
export default (category: string, name: string, defaultLevel?: LogLevel): Logger => {
  if (winston.loggers.has(`${category}-${name}`)) return winston.loggers.get(`${category}-${name}`)
  const level = getLogLevel(category, name, defaultLevel)

  winston.loggers.add(`${category}-${name}`, {
    format: combine(
      errorStackFormat(),
      label({
        label: `${category}-${name}`,
      }),
      timestamp({
        format: 'MMM-DD-YYYY HH:mm:ss',
      }),
      printf(
        (log) => `${log.level}: ${log.label}: ${log.timestamp}: ${log.message}` + (log.stack ? `\n${log.stack}` : ''),
      ),
    ),
    transports: [
      new winston.transports.Console({ level }),
      new winston.transports.File({
        level,
        filename: `logs/${category}-${name}.log`,
        maxsize: 5 * 1024 * 1024, // 5 MB
      }),
    ],
  })
  return winston.loggers.get(`${category}-${name}`)
}
