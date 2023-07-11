import dotenv from 'dotenv'

export const loadDotenv = () => {
  const args = require('minimist')(process.argv.slice(2))
  if (args.dotenvFile) {
    dotenv.config({ path: args.dotenvFile })
  } else {
    dotenv.config()
  }
}
