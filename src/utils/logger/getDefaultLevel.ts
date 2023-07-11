import { isProduction } from '../system'
import { LogLevel } from './logLevels'

export const getDefaultLevel = (): LogLevel => (isProduction() ? 'warn' : 'info')
