import express, { Request, Response } from 'express'
import helmet from 'helmet'
import http from 'http'
import { NETWORK, NODE_ENV, PASSWORDPROTECTION, PORT, RESPONSE_CODES } from './constants'
import { Queue } from './controllers/queue'
import { System } from './controllers/system'
import { startServer } from './controllers/system/startController'
import { addResponseHeaders } from './middleware/addResponseHeaders'
import loggerMiddleware from './middleware/logger'
import { passwordProtection } from './middleware/passwordProtection'
import getLogger from './src/utils/logger'

const logger = getLogger('error', 'log')
const serverLogger = getLogger('server', 'log')
process.on('uncaughtException', (err) =>
  logger.error(['There was an uncaught error', err.name, err.message, err.stack]),
)
serverLogger.info(['Environment:', NODE_ENV])
serverLogger.info(['Network:', NETWORK.bech32])
;(async () => {
  if (!PASSWORDPROTECTION) {
    await startServer('')
  }
})()

export const app = express()

const server = http.createServer(app)

// Security measures
app.use(helmet())
app.disable('x-powered-by')

app.set('trust proxy', 1) // trust first proxy

app.use(passwordProtection)
app.use(loggerMiddleware)

app.use(express.json())

app.disable('etag')
app.all('/*', addResponseHeaders({ 'Content-Type': 'application/json' }))

// Install Controllers
System(app)
Queue(app)

app.use((req: Request, res: Response<any>) => res.status(RESPONSE_CODES.NOT_FOUND).json({ error: 'NOT_FOUND' }))

server.listen({
  port: PORT,
  host: '0.0.0.0',
})

serverLogger.info(!PASSWORDPROTECTION ? 'Server initialised!' : 'Server started, awaiting password input...')
