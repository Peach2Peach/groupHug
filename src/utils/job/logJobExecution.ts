import { serializeJobEvent } from '.'
import { MSINS } from '../../../constants'
import { db } from '../db'
import { KEYS } from '../db/keys'
import getLogger from '../logger'
import { MAX_ENTRIES } from './constants'

type JobExecution = () => boolean | Promise<boolean>

export const logJobExecution = async (name: string, job: JobExecution) => {
  const logger = getLogger('job', name, 'info')
  const dbKey = KEYS.JOB.PREFIX + name
  logger.debug([`Starting job ${name}`])

  const start = new Date()
  // Log execution start
  await db.transaction(async (client) => {
    const jobEvent: JobEvent = {
      date: start,
      status: 'RUNNING',
    }
    await client.zadd(dbKey, start.getTime(), serializeJobEvent(jobEvent))
  })

  let jobResult = false
  try {
    jobResult = await job()
  } catch (e) {
    jobResult = false
    logger.error(['Job execution failed', e])
  }

  const status = jobResult ? 'OK' : 'ERROR'
  const end = new Date()
  const seconds = (end.getTime() - start.getTime()) / MSINS

  await db.transaction(async (client) => {
    const count = await db.zcount(dbKey)
    const jobEvent: JobEvent = {
      date: end,
      status,
      runningTime: end.getTime() - start.getTime(),
    }
    if (count >= MAX_ENTRIES) {
      await client.zpopmin(dbKey, 2)
    }
    await client.zadd(dbKey, end.getTime(), serializeJobEvent(jobEvent))
  })
  logger.debug([`Job ${name} finished with status ${status} and took ${seconds} seconds`])
}
