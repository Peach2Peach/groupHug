import dotenv from 'dotenv'
import { parseArgv } from './parseArgv'

export const loadDotenv = () => {
  const args = parseArgv(process.argv.slice(2))
  if (args.dotenvFile) {
    dotenv.config({ path: args.dotenvFile })
  } else {
    dotenv.config()
  }
}
